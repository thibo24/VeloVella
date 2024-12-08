namespace VeloVellaEnConsole.model
{
    public class Step
    {
        public double Distance { get; set; }
        public double Duration { get; set; }
        public int Type { get; set; }
        public string Instruction { get; set; }
        public string Name { get; set; }
        public int? Exit_Number { get; set; } // Nullable car pas toujours présent
        public double[] Way_Points { get; set; }
    }
}