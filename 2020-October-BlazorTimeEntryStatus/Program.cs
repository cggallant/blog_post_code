using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace BlazorTimeEntryStatus
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebAssemblyHostBuilder.CreateDefault(args);
            builder.RootComponents.Add<App>("app");

            // Using a demo database for the Dovico Timesheet API calls. A demo database is good for 30 days and there's no restrictions
            // if you need to create another when the trial runs out.
            //
            // System token
            string AccessToken = "access_token=\"client=a09af4b31071467dbd1730cd19a6b162.145303&user_token=3aa1215e1e2b447bb8458d7997d0a011.145303\"";// Demo database

            // Nancy Johnson (no employee access)
            //string AccessToken = "access_token=\"client=a09af4b31071467dbd1730cd19a6b162.145303&user_token=2378cdcc369c4b70a86c597c2a3695ab.145303\"";// Demo database

            // Set the default request headers for all HTTP calls
            HttpClient Http = new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) };
            Http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("WRAP", AccessToken);
            Http.DefaultRequestHeaders.Accept.Clear();
            Http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            // Add the HttpClient to the services collection
            builder.Services.AddScoped(sp => Http);

            await builder.Build().RunAsync();
        }
    }
}
