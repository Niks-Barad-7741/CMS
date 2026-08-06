using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.DTOs.Media;
using Dynamic_CMS.Application.Interfaces;
using Dynamic_CMS.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dynamic_CMS.API.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize] // Requires login
    public class MediaController : ControllerBase
    {
        private readonly IMediaService _mediaService;
        private readonly IWebHostEnvironment _env;

        public MediaController(IMediaService mediaService, IWebHostEnvironment env)
        {
            _mediaService = mediaService;
            _env = env;
        }

        [HttpGet("organization/{organizationId}")]
        public async Task<IActionResult> GetAllByOrganization(Guid organizationId)
        {
            var mediaList = await _mediaService.GetAllByOrganizationAsync(organizationId);
            if (mediaList == null || !mediaList.Any())
                return NotFound(ApiResponse.FailureResponse("No records found.", 404));

            return Ok(ApiResponse<IEnumerable<MediaDto>>.SuccessResponse(mediaList, "Operation successful"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var media = await _mediaService.GetByIdAsync(id);
            if (media == null)
                return NotFound(ApiResponse.FailureResponse("No records found.", 404));

            return Ok(ApiResponse<MediaDto>.SuccessResponse(media, "Operation successful"));
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(209715200)]
        [RequestFormLimits(MultipartBodyLengthLimit = 209715200)]
        public async Task<IActionResult> Upload([FromForm] UploadMediaDto dto)
        {
            var userIdString = User.FindFirst("UserId")?.Value;
            if (!Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized(ApiResponse.FailureResponse("Unauthorized.", 401));
            }

            var webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            
            var result = await _mediaService.UploadMediaAsync(dto, webRootPath, userId);
            
            if (!result.success)
            {
                return BadRequest(ApiResponse.FailureResponse(result.error ?? "Validation failed.", 400));
            }

            return CreatedAtAction(nameof(GetById), new { id = result.data!.Id }, 
                ApiResponse<MediaDto>.SuccessResponse(result.data, "Created successfully."));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            
            var result = await _mediaService.DeleteMediaAsync(id, webRootPath);
            if (!result.success)
            {
                return NotFound(ApiResponse.FailureResponse("Resource not found.", 404));
            }

            return Ok(ApiResponse.SuccessResponse("Deleted successfully."));
        }
    }
}
