using FluentValidation;
using Dynamic_CMS.Application.DTOs.Media;

namespace Dynamic_CMS.Application.Validators
{
    public class UploadMediaDtoValidator : AbstractValidator<UploadMediaDto>
    {
        public UploadMediaDtoValidator()
        {
            RuleFor(x => x.OrganizationId)
                .NotEmpty().WithMessage("Organization ID is required.");

            RuleFor(x => x.File)
                .NotNull().WithMessage("File is required.")
                .Must(file => file != null && file.Length > 0).WithMessage("File cannot be empty.")
                .Must(file => file == null || file.Length <= 10 * 1024 * 1024).WithMessage("File size cannot exceed 10 MB.")
                .Must(file =>
                {
                    if (file == null) return true;
                    var ext = System.IO.Path.GetExtension(file.FileName).ToLowerInvariant();
                    return ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".gif" || ext == ".webp";
                }).WithMessage("Only image files (.jpg, .jpeg, .png, .gif, .webp) are allowed.");
        }
    }
}
