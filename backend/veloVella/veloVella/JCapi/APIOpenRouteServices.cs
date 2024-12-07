using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace veloVella.JCapi
{
    internal class APIOpenRouteServices
    {
        private string apiKeyORS;
        private string apiBaseUrl;
        static readonly HttpClient client = new HttpClient();

        public APIOpenRouteServices(string apiKeyORS)
        {
            this.apiKeyORS = apiKeyORS;
            this.apiBaseUrl = "https://api.openrouteservice.org/v2/";
        }


        // https://api.openrouteservice.org /v2/directions/cycling-road/json

        public async Task<String> GetPathByVelo(Station start, Station end)
        {
            string coorStartX = start.position.latitude.ToString();
            string coorStartY = start.position.longitude.ToString();
            string coorEndX = end.position.latitude.ToString();
            string coorEndY = end.position.longitude.ToString();

            var jsonContent = $"{{\"coordinates\":[[{coorStartX},{coorStartY}],[{coorEndX},{coorEndY}]],\"instructions\":\"true\",\"instructions_format\":\"html\",\"language\":\"fr-fr\"}}";
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            return await callAPI("directions/cycling-road/geojson", content);
        }


        public async Task<String> GetPathByFoot(CityCoordinate pointCoordinateStart, CityCoordinate pointCoordinateEnd)
        {
            string coorStartX = pointCoordinateStart.CoordinateX;
            string coorStartY = pointCoordinateStart.CoordinateY;
            string coorEndX = pointCoordinateEnd.CoordinateX;
            string coorEndY = pointCoordinateEnd.CoordinateY;
            var jsonContent = $"{{\"coordinates\":[[{coorStartX},{coorStartY}],[{coorEndX},{coorEndY}]],\"instructions\":\"true\",\"instructions_format\":\"html\",\"language\":\"fr-fr\"}}";
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            return await callAPI("directions/foot-walking/geojson", content);

        }

        public async Task<String> callAPI(String url,StringContent content)
        {
            client.DefaultRequestHeaders.Add("Authorization", apiKeyORS);
            System.Console.WriteLine(apiBaseUrl + url);
            HttpResponseMessage response = await client.PostAsync(apiBaseUrl + url, content);
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();
            return responseBody;
        }

    }
}

