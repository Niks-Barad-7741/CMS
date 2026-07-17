namespace Dynamic_CMS.Application.DTOs
{
    public class ServiceResult<T>
    {
        public bool Success { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public T? Data { get; set; }

        public static ServiceResult<T> Ok(T data) => new ServiceResult<T> { Success = true, Data = data };
        public static ServiceResult<T> Fail(string errorMessage) => new ServiceResult<T> { Success = false, ErrorMessage = errorMessage };
    }
}
