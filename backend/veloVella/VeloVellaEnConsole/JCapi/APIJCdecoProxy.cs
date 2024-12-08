using Newtonsoft.Json;
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using veloVella.JCapi;
using VeloVellaEnConsole.model;

namespace veloVella
{
    // REMARQUE : vous pouvez utiliser la commande Renommer du menu Refactoriser pour changer le nom de classe "Service1" à la fois dans le code et le fichier de configuration.
    public class APIJCdecoProxy : IAPIJCdecoProxy
    {
        JCDecoAPI jcDeco;
        private APIOpenRouteServices ors;

        public APIJCdecoProxy()
        {
            jcDeco = new JCDecoAPI("df1b7a1918440d353f0c77bb1746833b8ac3ad96");
            ors = new APIOpenRouteServices("5b3ce3597851110001cf6248b5f19012002a4bb490e868b08c682897");
            jcDeco.InitializeContractsAsync();
        }

        public async Task<string> getPathBetwenToPoint(CityCoordinate pointCoordinateStart,
            CityCoordinate pointCoordinateEnd)
        {
            Station start = await GetClosestStation(pointCoordinateStart, true);
            Station end = await GetClosestStation(pointCoordinateEnd, false);
            String pathFullyByfoot = await ors.GetPathByFoot(pointCoordinateStart, pointCoordinateEnd);
            FeatureCollection RespORSfoot = JsonConvert.DeserializeObject<FeatureCollection>(pathFullyByfoot);

            if (start != null && end != null)
            {
                CityCoordinate test = new CityCoordinate(start.contractName, start.position);
                String pathToStartStation = await ors.GetPathByFoot(pointCoordinateStart, test);
                String pathByVelo = await ors.GetPathByVelo(start, end);
                String pathToDestination = await ors.GetPathByFoot(new CityCoordinate(end.contractName, end.position),
                    pointCoordinateEnd);
                FeatureCollection RespORSStartVelo =
                    JsonConvert.DeserializeObject<FeatureCollection>(pathToStartStation);
                FeatureCollection RespORSVelo = JsonConvert.DeserializeObject<FeatureCollection>(pathByVelo);
                FeatureCollection RespORSendVelo = JsonConvert.DeserializeObject<FeatureCollection>(pathToDestination);


                if (RespORSStartVelo == null || RespORSVelo == null || RespORSendVelo == null)
                {
                    Console.WriteLine("One of the FeatureCollections is null.");
                    return pathFullyByfoot;
                }

                if (RespORSendVelo.Features.FirstOrDefault()?.Properties?.Summary?.Duration +
                    RespORSVelo.Features.FirstOrDefault()?.Properties?.Summary?.Duration +
                    RespORSStartVelo.Features.FirstOrDefault()?.Properties?.Summary?.Duration <
                    RespORSfoot.Features.FirstOrDefault()?.Properties?.Summary?.Duration)
                {
                    Console.WriteLine("velo has been choosen");
                    return pathToStartStation + pathByVelo + pathToDestination;
                }
            }

            System.Console.WriteLine("foot has been choosne");
            return pathFullyByfoot;
        }
    

        private async Task<Station> GetClosestStation(CityCoordinate pointCoordinate , bool isStart)
        {
            Station closestStationStart = await jcDeco.getClosestContract(pointCoordinate, isStart);
            return closestStationStart;
        }
    }
}
