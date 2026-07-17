namespace Dynamic_CMS.Application.DTOs
{
    public class RegisterDto
    {
        private string _name = string.Empty;
        private string _email = string.Empty;
        private string _password = string.Empty;

        public string Name
        {
            get => _name;
            set => _name = value?.Trim() ?? string.Empty;
        }

        public string Email
        {
            get => _email;
            set => _email = value?.Trim() ?? string.Empty;
        }

        public string Password
        {
            get => _password;
            set => _password = value?.Trim() ?? string.Empty;
        }
    }
}
