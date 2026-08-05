using FluentValidation;
using Dynamic_CMS.Application.DTOs;
using System;

namespace Dynamic_CMS.Application.Validators
{
    public class UpdateLogoDtoValidator : AbstractValidator<UpdateLogoDto>
    {
        public UpdateLogoDtoValidator()
        {
            RuleFor(x => x.LogoUrl)
                .NotEmpty().WithMessage("Logo URL is required.");
        }
    }
}
