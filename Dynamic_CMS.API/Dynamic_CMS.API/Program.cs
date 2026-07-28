using Dynamic_CMS.API.Filters;
using Dynamic_CMS.Application;
using Dynamic_CMS.Infrastructure;
using Dynamic_CMS.Infrastructure.Data;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value != null && e.Value.Errors.Count > 0)
                .ToDictionary(
                    kvp => string.IsNullOrEmpty(kvp.Key) ? kvp.Key : char.ToLowerInvariant(kvp.Key[0]) + kvp.Key.Substring(1),
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                );

            var response = Dynamic_CMS.Application.DTOs.ApiResponse.FailureResponse(
                "Validation failed.", 400, errors);

            return new Microsoft.AspNetCore.Mvc.ObjectResult(response)
            {
                StatusCode = response.StatusCode
            };
        };
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "OrgCMS API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Paste JWT token only.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.OperationFilter<AuthorizeCheckOperationFilter>();
    c.SchemaFilter<GuidEmptyExampleSchemaFilter>();
});

// Register Application Layer DI (AutoMapper, FluentValidation, Services)
builder.Services.AddApplicationDI();

// Register Infrastructure Layer DI (DbContext, Repositories, JWT Auth)
builder.Services.AddInfrastructureDI(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Seed Database
await DataSeeder.SeedDataAsync(app.Services);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<Dynamic_CMS.API.Middlewares.ExceptionHandlingMiddleware>();

 //app.UseHttpsRedirection();

app.UseCors("AllowAngular");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
