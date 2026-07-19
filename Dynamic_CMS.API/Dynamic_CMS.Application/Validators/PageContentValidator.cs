using System;
using FluentValidation;
using Dynamic_CMS.Application.DTOs.PageContent;

namespace Dynamic_CMS.Application.Validators
{
    public class CreatePageContentValidator : AbstractValidator<CreatePageContentDto>
    {
        public CreatePageContentValidator()
        {
            RuleFor(x => x.OrganizationId)
                .NotEmpty().WithMessage("OrganizationId is required and cannot be empty.");

            RuleFor(x => x.MenuItemId)
                .NotEmpty().WithMessage("MenuItemId is required and cannot be empty.");

            RuleFor(x => x.Title)
                .NotNull().WithMessage("Title is required.")
                .NotEmpty().WithMessage("Title is required.")
                .NotEqual("string").WithMessage("Title cannot be 'string'.")
                .MinimumLength(2).WithMessage("Title must be at least 2 characters long.")
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

            // Trim check is handled by the rule or we can just ensure it's validated well.
            RuleFor(x => x.Title).Must(x => x != null && x.Trim() == x)
                .WithMessage("Title cannot have leading or trailing spaces.");

            RuleFor(x => x.BodyHtml)
                .NotNull().WithMessage("BodyHtml is required.")
                .NotEmpty().WithMessage("BodyHtml is required.")
                .NotEqual("string").WithMessage("BodyHtml cannot be 'string'.");

            RuleFor(x => x.BodyHtml).Must(x => x != null && x.Trim() == x)
                .WithMessage("BodyHtml cannot have leading or trailing spaces.");

            RuleFor(x => x.Status)
                .Must(x => string.IsNullOrEmpty(x) || x == "Draft" || x == "Published")
                .WithMessage("Status must be 'Draft', 'Published', or empty.");
        }
    }

    public class UpdatePageContentValidator : AbstractValidator<UpdatePageContentDto>
    {
        public UpdatePageContentValidator()
        {
            RuleFor(x => x.Title)
                .NotNull().WithMessage("Title is required.")
                .NotEmpty().WithMessage("Title is required.")
                .NotEqual("string").WithMessage("Title cannot be 'string'.")
                .MinimumLength(2).WithMessage("Title must be at least 2 characters long.")
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

            RuleFor(x => x.Title).Must(x => x != null && x.Trim() == x)
                .WithMessage("Title cannot have leading or trailing spaces.");

            RuleFor(x => x.BodyHtml)
                .NotNull().WithMessage("BodyHtml is required.")
                .NotEmpty().WithMessage("BodyHtml is required.")
                .NotEqual("string").WithMessage("BodyHtml cannot be 'string'.");

            RuleFor(x => x.BodyHtml).Must(x => x != null && x.Trim() == x)
                .WithMessage("BodyHtml cannot have leading or trailing spaces.");

            RuleFor(x => x.Status)
                .NotEmpty().WithMessage("Status is required.")
                .Must(x => x == "Draft" || x == "Published")
                .WithMessage("Status must be 'Draft' or 'Published'.");
        }
    }
}
