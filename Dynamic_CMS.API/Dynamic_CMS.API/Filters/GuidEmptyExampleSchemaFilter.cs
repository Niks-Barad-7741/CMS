using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;
using System.Linq;
using System.Reflection;

namespace Dynamic_CMS.API.Filters
{
    public class GuidEmptyExampleSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (schema?.Properties == null || context.Type == null)
            {
                return;
            }
            if (context.Type.GetProperties()
               .Any(p => p.PropertyType == typeof(IFormFile)))
            {
                return;
            }
            // Only apply if the type is likely used in a request body (e.g., ending with Dto) 
            // and contains Guid properties ending with "Id"
            var properties = context.Type.GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var schemaProperty in schema.Properties)
            {
                var propertyName = schemaProperty.Key;
                
                // Find matching property in the C# type (case-insensitive)
                var propInfo = properties.FirstOrDefault(p => string.Equals(p.Name, propertyName, StringComparison.OrdinalIgnoreCase));
                
                if (propInfo != null)
                {
                    bool isGuid = propInfo.PropertyType == typeof(Guid) || propInfo.PropertyType == typeof(Guid?);
                    
                    if (isGuid && propertyName.EndsWith("id", StringComparison.OrdinalIgnoreCase))
                    {
                        // Set the example to an empty string instead of the default Guid
                        schemaProperty.Value.Example = new OpenApiString("");
                    }
                }
            }
        }
    }
}
