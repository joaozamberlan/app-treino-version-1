import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import jsPDF from "jspdf";
import "jspdf-autotable";
import supabase from "@/lib/supabase"; // Certifique-se de que o caminho está correto

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
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [series, setSeries] = useState("");
  const [reps, setReps] = useState("");
  const [method, setMethod] = useState("");
  const [observations, setObservations] = useState("");
  const [currentTreino, setCurrentTreino] = useState({ name: "", exercises: [] }); // Treino atual
  const [muscleTarget, setMuscleTarget] = useState("");
  const [aerobicTraining, setAerobicTraining] = useState("");
  const [treinos, setTreinos] = useState([]); // Armazena múltiplos treinos

  const addExercise = () => {
    if (selectedExercise && series && reps) {
      setCurrentTreino((prev) => ({
        ...prev,
        exercises: [...prev.exercises, { exercise: selectedExercise, series, reps, method, observations }]
      }));
      setSeries("");
      setReps("");
      setMethod("");
      setObservations("");
    }
  };

  const removeExercise = (index) => {
    setCurrentTreino((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Treino - ${currentTreino.name}`, 10, 10);
    doc.text(`Músculos alvo: ${muscleTarget}`, 10, 20);
    doc.text(`Treino aeróbico: ${aerobicTraining}`, 10, 30);
    doc.text("Aquecimento: Ler sugestão apresentada abaixo.", 10, 40);
    
    doc.autoTable({
      startY: 50,
      head: [["Ordem dos Exercícios", "Nome dos Exercícios", "Séries", "Repetições", "Método de Treinamento", "Observações"]],
      body: currentTreino.exercises.map((item, index) => [
        `Exercício ${index + 1}`,
        item.exercise,
        item.series,
        item.reps,
        item.method,
        item.observations
      ]),
      theme: "grid",
      styles: { halign: "center" }
    });
    
    doc.save(`${currentTreino.name}.pdf`);
  };

  const saveTreino = async () => {
    if (currentTreino.name && currentTreino.exercises.length > 0) {
      // Salvar no Supabase
      const { data, error } = await supabase.from("treinos").insert([
        {
          treino_nome: currentTreino.name,
          musculos: muscleTarget,
          aerobico: aerobicTraining,
          exercicios: currentTreino.exercises,
        },
      ]);

      if (error) {
        console.error("Erro ao salvar treino:", error);
      } else {
        console.log("Treino salvo com sucesso!", data);
        setTreinos([...treinos, currentTreino]); // Adiciona o treino à lista local
        setCurrentTreino({ name: "", exercises: [] }); // Limpa o treino atual
      }
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <Input placeholder="Nome do Treino" value={currentTreino.name} onChange={(e) => setCurrentTreino({ ...currentTreino, name: e.target.value })} />
      <Input placeholder="Músculos Alvo" value={muscleTarget} onChange={(e) => setMuscleTarget(e.target.value)} />
      <Input placeholder="Treino Aeróbico" value={aerobicTraining} onChange={(e) => setAerobicTraining(e.target.value)} />

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

      <Card>
        <CardContent>
          {currentTreino.exercises.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <p>{index + 1}. {item.exercise} - {item.series}x{item.reps} - {item.method} - {item.observations}</p>
              <Button variant="destructive" size="sm" onClick={() => removeExercise(index)}>Remover</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={saveTreino}>Salvar Treino</Button>
      <Button onClick={generatePDF}>Gerar PDF</Button>

      <div>
        <h2>Treinos Salvos:</h2>
        {treinos.map((treino, index) => (
          <div key={index}>
            <h3>{treino.name}</h3>
            <ul>
              {treino.exercises.map((exercise, i) => (
                <li key={i}>{exercise.exercise} - {exercise.series}x{exercise.reps}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}