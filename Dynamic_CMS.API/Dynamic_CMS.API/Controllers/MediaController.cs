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
            return Ok(ApiResponse<object>.SuccessResponse(mediaList, "Media retrieved successfully."));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var media = await _mediaService.GetByIdAsync(id);
            if (media == null)
                return NotFound(ApiResponse<object>.FailureResponse("Media not found.", 404));

            return Ok(ApiResponse<object>.SuccessResponse(media));
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload([FromForm] UploadMediaDto dto)
        {
            var userIdString = User.FindFirst("UserId")?.Value;
            if (!Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized(ApiResponse<object>.FailureResponse("Invalid user token.", 401));
            }

            var webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            
            var result = await _mediaService.UploadMediaAsync(dto, webRootPath, userId);
            
            if (!result.success)
            {
                return BadRequest(ApiResponse<object>.FailureResponse(result.error ?? "Failed to upload media.", 400));
            }

            return CreatedAtAction(nameof(GetById), new { id = result.data!.Id }, 
                ApiResponse<object>.Create(ResponseStatus.MediaUploadedSuccessfully, result.data));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            
            var result = await _mediaService.DeleteMediaAsync(id, webRootPath);
            if (!result.success)
            {
                return NotFound(ApiResponse<object>.FailureResponse(result.error ?? "Media not found.", 404));
            }

            return Ok(ApiResponse<object>.Create(ResponseStatus.MediaDeletedSuccessfully));
        }
    }
}
