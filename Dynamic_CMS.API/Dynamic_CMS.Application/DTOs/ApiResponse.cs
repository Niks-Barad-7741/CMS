using Dynamic_CMS.Domain.Enums;

namespace Dynamic_CMS.Application.DTOs
{
    public class ApiResponse
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;

        [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
        public System.Collections.Generic.IDictionary<string, string[]>? Errors { get; set; }

        public ApiResponse() { }

        public ApiResponse(bool success, int statusCode, string message, System.Collections.Generic.IDictionary<string, string[]>? errors = null)
        {
            Success = success;
            StatusCode = statusCode;
            Message = message;
            Errors = errors;
        }

        public static ApiResponse SuccessResponse(string message = "Operation successful")
        {
            return new ApiResponse(true, 200, message);
        }
        
        public static ApiResponse CreatedResponse(string message = "Created successfully.")
        {
            return new ApiResponse(true, 201, message);
        }

        public static ApiResponse FailureResponse(string message, int statusCode = 400, System.Collections.Generic.IDictionary<string, string[]>? errors = null)
        {
            return new ApiResponse(false, statusCode, message, errors);
        }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }

        public ApiResponse() { }

        public ApiResponse(bool success, int statusCode, string message, T? data)
        {
            Success = success;
            StatusCode = statusCode;
            Message = message;
            Data = data;
        }

        // Factory using ResponseStatus enum
        public static ApiResponse<T> Create(ResponseStatus status, T? data = default)
        {
            return new ApiResponse<T>(
                status.IsSuccess(),
                status.GetStatusCode(),
                status.ToFriendlyMessage(),
                data
            );
        }

        // Factory using ResponseStatus with custom override message string
        public static ApiResponse<T> Create(ResponseStatus status, string customMessage, T? data = default)
        {
            return new ApiResponse<T>(
                status.IsSuccess(),
                status.GetStatusCode(),
                customMessage,
                data
            );
        }

        // Standard factory methods
        public static ApiResponse<T> SuccessResponse(T data, string message = "Operation successful")
        {
            return new ApiResponse<T>(true, 200, message, data);
        }

        public static ApiResponse<T> FailureResponse(string message, int statusCode = 400, T? data = default)
        {
            return new ApiResponse<T>(false, statusCode, message, data);
        }
    }
}
