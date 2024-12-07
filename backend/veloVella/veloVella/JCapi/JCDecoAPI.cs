using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Http;
using System.Text.Json;
using System.Device.Location;
using System.Security.Policy;
using System.Text;



namespace veloVella
{
    internal class JCDecoAPI
    {
        String apiKeyJCDECO;
        String apiBaseUrl;
        static readonly HttpClient client = new HttpClient();

        private List<Contract> contracts;

        public JCDecoAPI(string apiKeyJcdeco)
        {
            apiKeyJCDECO = "?apiKey=" + apiKeyJcdeco + "&";
            apiBaseUrl = "https://api.jcdecaux.com/vls/v3/";
            contracts = new List<Contract>();
        }

        public async Task InitializeContractsAsync()
        {
            contracts = await getContracts();
            System.Console.WriteLine("Contracts initialized");
        }

        public async Task<List<Contract>> getContracts()
        {

            string response = await callAPI("contracts" + apiKeyJCDECO);

            var contracts = JsonSerializer.Deserialize<List<Contract>>(
                response,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            return contracts ?? new List<Contract>();
        }

        public async Task<List<Station>> getStations(string contractName)
        {
            string response = await callAPI("stations" + apiKeyJCDECO + "contractName="+contractName);
            var contracts = JsonSerializer.Deserialize<List<Station>>(response,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return contracts;
        }


        public Contract getContractsByName(string name)
        {
            foreach (var contract in contracts)
            {
                foreach (var cites in contract.cities)
                {
                    if (cites == name)
                    {
                        return contract;
                    }
                }
            }

            return null;
        }

        public async Task<Station> getClosestContract(CityCoordinate pointCoordinate)
        {
            var geoCoordinate = new GeoCoordinate(double.Parse(pointCoordinate.CoordinateX),
                double.Parse(pointCoordinate.CoordinateY));
            Station closestStation = null;
            Double closestDistance = double.MaxValue;
            Contract contract = getContractsByName(pointCoordinate.CityName);
            List<Station> stations = await getStations(contract.name);


            foreach (var station in stations)
            {
                var stationCoordinate = new GeoCoordinate(station.position.latitude, station.position.longitude);
                double distance = geoCoordinate.GetDistanceTo(stationCoordinate);
                if (distance < closestDistance)
                {
                    closestDistance = distance;
                    closestStation = station;
                }

            }

            if (closestStation != null)
            {
                return closestStation;
            }
            else
            {
                Console.WriteLine("No other stations found.");
                return null;
            }
        }

        public async Task<String> callAPI(String url)
        {
            System.Console.WriteLine(apiBaseUrl + url);
            HttpResponseMessage response = await client.GetAsync(apiBaseUrl + url);
            response.EnsureSuccessStatusCode();
            string responseBody = await response.Content.ReadAsStringAsync();
            return responseBody;
        }

    }
}
