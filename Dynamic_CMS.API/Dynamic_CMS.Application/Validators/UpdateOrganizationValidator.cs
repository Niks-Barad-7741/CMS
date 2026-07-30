using FluentValidation;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Domain.Repositories;
using System.Linq;

namespace Dynamic_CMS.Application.Validators
{
    public class UpdateOrganizationValidator : AbstractValidator<UpdateOrganizationDto>
    {
        private readonly string[] _reservedSlugs = { "admin", "www", "api", "app" };

        public UpdateOrganizationValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Organization Name is required.")
                .MaximumLength(100).WithMessage("Organization Name must not exceed 100 characters.");

            RuleFor(x => x.Slug)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Subdomain Slug is required.")
                .MaximumLength(100).WithMessage("Subdomain Slug must not exceed 100 characters.")
                .Matches(@"^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)*$").WithMessage("Subdomain Slug must start with an alphanumeric character and be a valid format.")
                .Must(slug => !_reservedSlugs.Contains(slug)).WithMessage("This subdomain slug is reserved and cannot be used.");

            RuleFor(x => x.ContactEmail)
                .EmailAddress().WithMessage("Contact Email must be a valid email address.")
                .When(x => !string.IsNullOrEmpty(x.ContactEmail));

            RuleFor(x => x.ContactPhone)
                .Matches(@"^\d{10}$").WithMessage("Contact Phone must be a 10-digit number.")
                .When(x => !string.IsNullOrEmpty(x.ContactPhone));

            RuleFor(x => x.SocialTwitter)
                .Must(TwitterLinkMustBeValid).WithMessage("Twitter link must be a valid URL containing twitter.com or x.com.")
                .When(x => !string.IsNullOrEmpty(x.SocialTwitter));

            RuleFor(x => x.SocialFacebook)
                .Must(FacebookLinkOrHandleMustBeValid).WithMessage("Facebook field must be a valid alphanumeric ID or a valid URL containing facebook.com.")
                .When(x => !string.IsNullOrEmpty(x.SocialFacebook));

            RuleFor(x => x.SocialInstagram)
                .Must(InstagramLinkOrHandleMustBeValid).WithMessage("Instagram field must be a valid alphanumeric ID or a valid URL containing instagram.com.")
                .When(x => !string.IsNullOrEmpty(x.SocialInstagram));
        }

        private bool TwitterLinkMustBeValid(string? link)
        {
            if (string.IsNullOrEmpty(link)) return true;
            if (!System.Uri.TryCreate(link, System.UriKind.Absolute, out var outUri) 
                || (outUri.Scheme != System.Uri.UriSchemeHttp && outUri.Scheme != System.Uri.UriSchemeHttps))
            {
                return false;
            }
            var host = outUri.Host.ToLower();
            return host.Contains("twitter.com") || host.Contains("x.com");
        }

        private bool FacebookLinkOrHandleMustBeValid(string? val)
        {
            if (string.IsNullOrEmpty(val)) return true;
            if (val.StartsWith("http://") || val.StartsWith("https://"))
            {
                if (!System.Uri.TryCreate(val, System.UriKind.Absolute, out var outUri)
                    || (outUri.Scheme != System.Uri.UriSchemeHttp && outUri.Scheme != System.Uri.UriSchemeHttps))
                {
                    return false;
                }
                return outUri.Host.ToLower().Contains("facebook.com");
            }
            return System.Text.RegularExpressions.Regex.IsMatch(val, @"^[a-zA-Z0-9._/]+$");
        }

        private bool InstagramLinkOrHandleMustBeValid(string? val)
        {
            if (string.IsNullOrEmpty(val)) return true;
            if (val.StartsWith("http://") || val.StartsWith("https://"))
            {
                if (!System.Uri.TryCreate(val, System.UriKind.Absolute, out var outUri)
                    || (outUri.Scheme != System.Uri.UriSchemeHttp && outUri.Scheme != System.Uri.UriSchemeHttps))
                {
                    return false;
                }
                return outUri.Host.ToLower().Contains("instagram.com");
            }
            return System.Text.RegularExpressions.Regex.IsMatch(val, @"^[a-zA-Z0-9._/]+$");
        }
    }
}
