using System;
using FluentValidation;
using Dynamic_CMS.Application.DTOs;

namespace Dynamic_CMS.Application.Validators
{
    public class LoginValidator : AbstractValidator<LoginDto>
    {
        public LoginValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .Must(x => x == null || !x.Equals("string", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Default 'string' value is not allowed.")
                .Must(x => x == null || x.Trim() == x)
                .WithMessage("This field cannot contain leading or trailing spaces.")
                .EmailAddress().WithMessage("Please enter a valid email address.")
                .Matches(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
                .WithMessage("Please enter a valid email address.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .Must(x => x == null || !x.Equals("string", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Default 'string' value is not allowed.")
                .Must(x => x == null || x.Trim() == x)
                .WithMessage("This field cannot contain leading or trailing spaces.");
        }
    }
}
