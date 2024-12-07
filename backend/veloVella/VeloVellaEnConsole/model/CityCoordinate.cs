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
        public CityCoordinate()
        { }

        public CityCoordinate(string city, string coordinateX, string coordinateY)
        {
            this.CityName = city;
            this.CoordinateX = coordinateX;
            this.CoordinateY = coordinateY;
        }
        [DataMember]
        public string CityName { get; set; }

        [DataMember]
        public string CoordinateX { get; set; }

        [DataMember]
        public string CoordinateY { get; set; }
    }
}