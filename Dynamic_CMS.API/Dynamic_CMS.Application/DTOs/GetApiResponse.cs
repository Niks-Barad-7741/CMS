namespace Dynamic_CMS.Application.DTOs
{
    public class GetApiResponse
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;

        public GetApiResponse(bool success, int statusCode, string message)
        {
            Success = success;
            StatusCode = statusCode;
            Message = message;
        }

        public static GetApiResponse SuccessResponse(string message = "Operation successful")
        {
            return new GetApiResponse(true, 200, message);
        }

        public static GetApiResponse FailureResponse(string message = "No records found.", int statusCode = 404)
        {
            return new GetApiResponse(false, statusCode, message);
        }
    }
}
