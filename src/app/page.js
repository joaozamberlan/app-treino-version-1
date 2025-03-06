import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import jsPDF from "jspdf";
import "jspdf-autotable";

const exercisesDB = {
  Peito: [
    "Supino Reto", "Crucifixo", "Flexão de Braço",
    "Supino Máquina Reto", "Supino Máquina Inclinado", "Supino Máquina Declinado",
    "Mergulho / Paralela", "Cross-over Baixo", "Voador"
  ],
  Costas: [
    "Barra Fixa", "Remada Curvada", "Pulldown",
    "Remada Articulada", "Pull Around", "Puxador Frontal com Pegada Triângulo",
    "T Row", "Remada Baixa"
  ],
  Ombro: [
    "Elevação Lateral Halter", "Elevação Lateral Polia", "Elevação Frontal",
    "Desenvolvimento", "Face Pull", "Crucifixo Invertido"
  ],
  Bíceps: [
    "Rosca Scott", "Rosca Bayesian", "Rosca Banco 45"
  ],
  Tríceps: [
    "Tríceps Francês Polia", "Tríceps Testa Polia", "Tríceps Corda"
  ],
  Quadríceps: [
    "Hack 45", "Leg 45", "Agachamento Livre", "Agachamento Smith",
    "Agachamento Máquina Articulada", "Cadeira Extensora"
  ],
  "Posterior de Coxa": [
    "Mesa Flexora", "Cadeira Flexora", "Stiff"
  ]
};

export default function TreinoApp() {
  const [treinos, setTreinos] = useState({});
  const [treinoAtual, setTreinoAtual] = useState("Treino A");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [series, setSeries] = useState("");
  const [reps, setReps] = useState("");
  const [method, setMethod] = useState("");
  const [observations, setObservations] = useState("");
  const [muscleTarget, setMuscleTarget] = useState("");
  const [aerobicTraining, setAerobicTraining] = useState("");

  const addExercise = () => {
    if (selectedExercise && series && reps) {
      setTreinos({
        ...treinos,
        [treinoAtual]: [...(treinos[treinoAtual] || []), { exercise: selectedExercise, series, reps, method, observations }]
      });
      setSeries("");
      setReps("");
      setMethod("");
      setObservations("");
    }
  };

  const removeExercise = (treino, index) => {
    setTreinos({
      ...treinos,
      [treino]: treinos[treino].filter((_, i) => i !== index)
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Treinos`, 10, 10);
    Object.entries(treinos).forEach(([treino, exercises], idx) => {
      doc.text(`${treino}`, 10, 20 + idx * 10);
      doc.autoTable({
        startY: 30 + idx * 10,
        head: [["Exercício", "Séries", "Repetições", "Método", "Observações"]],
        body: exercises.map((item, index) => [
          item.exercise,
          item.series,
          item.reps,
          item.method,
          item.observations
        ]),
        theme: "grid",
        styles: { halign: "center" }
      });
    });
    doc.save("treinos.pdf");
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <Input placeholder="Músculos Alvo" value={muscleTarget} onChange={(e) => setMuscleTarget(e.target.value)} />
      <Input placeholder="Treino Aeróbico" value={aerobicTraining} onChange={(e) => setAerobicTraining(e.target.value)} />

      <Select onValueChange={setTreinoAtual}>
        <SelectTrigger>Selecione um Treino</SelectTrigger>
        <SelectContent>
          {["Treino A", "Treino B", "Treino C"].map((treino) => (
            <SelectItem key={treino} value={treino}>{treino}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={setSelectedGroup}>
        <SelectTrigger>Selecione um grupo muscular</SelectTrigger>
        <SelectContent>
          {Object.keys(exercisesDB).map((group) => (
            <SelectItem key={group} value={group}>{group}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedGroup && (
        <Select onValueChange={setSelectedExercise}>
          <SelectTrigger>Selecione um exercício</SelectTrigger>
          <SelectContent>
            {exercisesDB[selectedGroup].map((exercise) => (
              <SelectItem key={exercise} value={exercise}>{exercise}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Input placeholder="Séries" value={series} onChange={(e) => setSeries(e.target.value)} />
      <Input placeholder="Repetições" value={reps} onChange={(e) => setReps(e.target.value)} />
      <Input placeholder="Método de Treinamento" value={method} onChange={(e) => setMethod(e.target.value)} />
      <Input placeholder="Observações" value={observations} onChange={(e) => setObservations(e.target.value)} />

      <Button onClick={addExercise}>Adicionar Exercício</Button>

      {Object.entries(treinos).map(([treino, exercises]) => (
        <Card key={treino} className="mt-4">
          <CardContent>
            <h3>{treino}</h3>
            {exercises.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <p>{index + 1}. {item.exercise} - {item.series}x{item.reps} - {item.method} - {item.observations}</p>
                <Button variant="destructive" size="sm" onClick={() => removeExercise(treino, index)}>Remover</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button onClick={generatePDF}>Gerar PDF</Button>
    </div>
  );
}
