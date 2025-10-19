using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PfeProject.API.Middlewares
{
    public class CompanyDataIsolationMiddleware
    {
        private readonly RequestDelegate _next;

        public CompanyDataIsolationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Add company ID to context for easy access in controllers
            if (context.User.Identity.IsAuthenticated)
            {
                var companyIdClaim = context.User.FindFirst("CompanyId");
                if (companyIdClaim != null && int.TryParse(companyIdClaim.Value, out int companyId))
                {
                    context.Items["CompanyId"] = companyId;
                }
            }

            await _next(context);
        }
    }
}
