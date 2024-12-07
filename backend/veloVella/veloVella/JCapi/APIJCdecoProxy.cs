using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;
using veloVella.JCapi;

namespace veloVella
{
    // REMARQUE : vous pouvez utiliser la commande Renommer du menu Refactoriser pour changer le nom de classe "Service1" à la fois dans le code et le fichier de configuration.
    public class APIJCdecoProxy : IAPIJCdecoProxy
    {
        JCDecoAPI jcDeco;
        private APIOpenRouteServices ors;

        public APIJCdecoProxy(){
            jcDeco = new JCDecoAPI("df1b7a1918440d353f0c77bb1746833b8ac3ad96");
            ors = new APIOpenRouteServices("5b3ce3597851110001cf6248b5f19012002a4bb490e868b08c682897");
            jcDeco.InitializeContractsAsync();
        }
        public async Task<string> getPathBetwenToPoint(CityCoordinate pointCoordinateStart,
            CityCoordinate pointCoordinateEnd)
        {
            Station start = await GetClosestStation(pointCoordinateStart);
            Station end = await GetClosestStation(pointCoordinateEnd);
            String pathFullyByfoot = await ors.GetPathByFoot(pointCoordinateStart, pointCoordinateEnd);
            if(start != null && end != null)
            {
                String pathToStartStation = await ors.GetPathByFoot(pointCoordinateStart,
                    new CityCoordinate(start.contractName, start.position));
                String pathByVelo =  await ors.GetPathByVelo(start, end);
                String pathToDestination = await ors.GetPathByFoot(new CityCoordinate(end.contractName, end.position), pointCoordinateEnd);
                return pathToStartStation + pathByVelo + pathToDestination;
            }
            else
            {
                return pathFullyByfoot;
            }
        }

        private  async Task<Station> GetClosestStation(CityCoordinate pointCoordinate )
        {
            Station closestStationStart = await jcDeco.getClosestContract(pointCoordinate);
            return closestStationStart;
        }
    }
}
