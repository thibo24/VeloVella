using System.Collections.Specialized;
using System.Runtime.Serialization;

namespace veloVella
{
    [DataContract]
    public class CityCoordinate
    {
        public CityCoordinate(string city, Position position)
        {
            this.CityName= city;
            this.CoordinateX = position.latitude.ToString();
            this.CoordinateY = position.longitude.ToString();

        }

        [DataMember]
        public string CityName { get; set; }

        [DataMember]
        public string CoordinateX { get; set; }

        [DataMember]
        public string CoordinateY { get; set; }
    }
}