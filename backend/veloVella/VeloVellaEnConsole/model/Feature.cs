namespace VeloVellaEnConsole.model
{
    public class Feature
    {
        public double[] Bbox { get; set; }
        public string Type { get; set; }
        public Properties Properties { get; set; }
        public Geometry Geometry { get; set; }
    }
}