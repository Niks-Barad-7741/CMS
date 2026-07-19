using System;

namespace Dynamic_CMS.Domain.Enums
{
    public enum ResponseStatus
    {
        // Success
        Success,
        Created,
        MenuRetrievedSuccessfully,
        MenuCreatedSuccessfully,
        MenuUpdatedSuccessfully,
        MenuDeletedSuccessfully,

        // Errors
        BadRequest,
        Unauthorized,
        Forbidden,
        NotFound,
        InternalServerError,
        MenuNotFound,
        MenuAlreadyExists,
        
        MediaUploadedSuccessfully,
        MediaDeletedSuccessfully
    }

    public static class ResponseStatusExtensions
    {
        public static int GetStatusCode(this ResponseStatus status) => status switch
        {
            ResponseStatus.Success => 200,
            ResponseStatus.Created => 201,
            ResponseStatus.MenuRetrievedSuccessfully => 200,
            ResponseStatus.MenuCreatedSuccessfully => 201,
            ResponseStatus.MenuUpdatedSuccessfully => 200,
            ResponseStatus.MenuDeletedSuccessfully => 200,

            ResponseStatus.MediaUploadedSuccessfully => 201,
            ResponseStatus.MediaDeletedSuccessfully => 200,

            ResponseStatus.BadRequest => 400,
            ResponseStatus.Unauthorized => 401,
            ResponseStatus.Forbidden => 403,
            ResponseStatus.NotFound => 404,
            ResponseStatus.MenuNotFound => 404,
            ResponseStatus.MenuAlreadyExists => 409,
            ResponseStatus.InternalServerError => 500,
            _ => 200
        };

        public static string ToFriendlyMessage(this ResponseStatus status) => status switch
        {
            ResponseStatus.Success => "Operation completed successfully.",
            ResponseStatus.Created => "Resource created successfully.",
            ResponseStatus.MenuRetrievedSuccessfully => "Menu retrieved successfully.",
            ResponseStatus.MenuCreatedSuccessfully => "Menu created successfully.",
            ResponseStatus.MenuUpdatedSuccessfully => "Menu updated successfully.",
            ResponseStatus.MenuDeletedSuccessfully => "Menu deleted successfully.",
            
            ResponseStatus.MediaUploadedSuccessfully => "Media file uploaded successfully.",
            ResponseStatus.MediaDeletedSuccessfully => "Media file deleted successfully.",
            
            ResponseStatus.BadRequest => "Bad Request. Please check your inputs.",
            ResponseStatus.Unauthorized => "Unauthorized. Please log in.",
            ResponseStatus.Forbidden => "Forbidden. You do not have the required permissions.",
            ResponseStatus.NotFound => "Resource not found.",
            ResponseStatus.MenuNotFound => "Menu item not found.",
            ResponseStatus.MenuAlreadyExists => "A menu item with this slug or title already exists.",
            ResponseStatus.InternalServerError => "An unexpected internal server error occurred.",
            
            _ => status.ToString()
        };

        public static bool IsSuccess(this ResponseStatus status)
        {
            int code = status.GetStatusCode();
            return code >= 200 && code < 300;
        }
    }
}
