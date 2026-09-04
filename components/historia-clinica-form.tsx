"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const Question = ({ question, name, onValueChange }: { question: string; name: string; onValueChange: (value: "si" | "no") => void }) => (
  <div className="flex items-center justify-between py-2">
    <p className="text-sm font-medium">{question}</p>
    <RadioGroup name={name} onValueChange={onValueChange} className="flex gap-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="si" id={`${name}-si`} />
        <Label htmlFor={`${name}-si`}>Sí</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="no" id={`${name}-no`} />
        <Label htmlFor={`${name}-no`}>No</Label>
      </div>
    </RadioGroup>
  </div>
);

export default function HistoriaClinicaForm() {
  return (
    <Card className="w-full max-w-4xl mx-auto my-8 neomorphic border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Historia Clínica Dental</CardTitle>
        <CardDescription>Por favor, complete la siguiente información.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Datos Personales */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Datos Personales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="empresa">Empresa</Label>
              <Input id="empresa" placeholder="Nombre de la empresa" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="antiguedad">Antigüedad</Label>
              <Input id="antiguedad" placeholder="Ej. 5 años" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" placeholder="Nombre completo del paciente" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ocupacion">Ocupación</Label>
              <Input id="ocupacion" placeholder="Ocupación actual" />
            </div>
            <div className="space-y-1 lg:col-span-3">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" placeholder="Dirección completa" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edad">Edad</Label>
              <Input id="edad" type="number" placeholder="Edad" />
            </div>
            <div className="space-y-1">
              <Label>Sexo</Label>
              <RadioGroup defaultValue="masculino" className="flex gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="masculino" id="masculino" />
                  <Label htmlFor="masculino">Masculino</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="femenino" id="femenino" />
                  <Label htmlFor="femenino">Femenino</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="correo@ejemplo.com" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cel">Celular</Label>
              <Input id="cel" placeholder="Número de celular" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tel">Teléfono (Casa/Oficina)</Label>
              <Input id="tel" placeholder="Número de teléfono fijo" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="recomendado">Recomendado por</Label>
              <Input id="recomendado" placeholder="¿Quién nos recomendó?" />
            </div>
          </div>
        </section>

        {/* Antecedentes Personales */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Antecedentes Personales</h3>
          <div className="divide-y divide-border/50">
            <Question name="alergico" question="¿Es usted alérgico a algún medicamento?" onValueChange={() => {}} />
            <Input className="mt-2" placeholder="¿Cuál?" />

            <Question name="saludBuena" question="¿Su estado de salud lo considera bueno?" onValueChange={() => {}} />
            <Question name="medicoUltimoAnio" question="¿Ha acudido al médico en el último año?" onValueChange={() => {}} />
            <Question name="enfermedadUltimos6Meses" question="¿Ha padecido alguna enfermedad en los últimos 6 meses?" onValueChange={() => {}} />
            <Input className="mt-2" placeholder="¿Cuáles?" />

            <Question name="hipertension" question="¿Hipertensión arterial?" onValueChange={() => {}} />
            <Input className="mt-2" placeholder="mmhg" />

            <Question name="tomandoMedicamento" question="¿Está tomando algún medicamento?" onValueChange={() => {}} />
            <Input className="mt-2" placeholder="¿Cuál?" />

            <Question name="enfermedadInfecciosa" question="¿Padece o ha padecido alguna enfermedad infecciosa? (Sida, Hepatitis, etc.)" onValueChange={() => {}} />
            <Question name="diabetes" question="¿Padece diabetes o ha sospechado tenerla?" onValueChange={() => {}} />
            <Input className="mt-2" placeholder="Último resultado de nivel de glucosa y fecha" />

            <Question name="alteracionesRenales" question="¿Alteraciones renales, diálisis, insuficiencia renal?" onValueChange={() => {}} />
            <Question name="cancer" question="¿Cáncer, quimioterapia o radioterapia?" onValueChange={() => {}} />
            <Question name="sangradoExcesivo" question="¿Presenta sangrado excesivo, hemorragias, leucemia, hemofilia?" onValueChange={() => {}} />
            <Question name="embarazada" question="¿Se encuentra embarazada?" onValueChange={() => {}} />
            <Input className="mt-2" placeholder="¿Cuántos meses? / ¿Ha sufrido abortos o legrados?" />

            <Question name="epilepsia" question="¿Ataques de epilepsia?" onValueChange={() => {}} />
            <Question name="medicamentosAnticoagulantes" question="¿Usa medicamentos anticoagulantes o tranquilizantes?" onValueChange={() => {}} />
            <Question name="aspirinas" question="¿Toma usted aspirinas?" onValueChange={() => {}} />
            <Input className="mt-2" placeholder="¿Con qué frecuencia?" />

            <div className="pt-4">
              <Label htmlFor="notas-antecedentes">Nota:</Label>
              <Textarea id="notas-antecedentes" placeholder="Alguna nota adicional sobre sus antecedentes..." />
            </div>

            <div className="pt-4">
              <Label htmlFor="firma-antecedentes">Firma</Label>
              <Input id="firma-antecedentes" placeholder="Escriba su nombre completo para firmar" />
            </div>
          </div>
        </section>

        {/* Historia Clínica Dental */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Historia Clínica Dental</h3>
          <div className="divide-y divide-border/50">
            <Question name="ultimaVisitaDentista" question="¿Cuándo fue la última visita al dentista?" onValueChange={() => {}} />
            <Question name="dolorDental" question="¿Presenta dolor dental actualmente?" onValueChange={() => {}} />
            <Input className="mt-2" placeholder="¿Con qué frecuencia?" />

            <Question name="anestesia" question="¿Lo han anestesiado alguna vez?" onValueChange={() => {}} />
            <Question name="reaccionAlergicaAnestesia" question="¿Ha presentado alguna reacción alérgica a la anestesia?" onValueChange={() => {}} />
            <Question name="complicacionVisitaDental" question="¿Ha sufrido alguna complicación durante su visita dental?" onValueChange={() => {}} />
            <Question name="impedimentoAnestesia" question="¿Existe algún impedimento médico por lo cual no se pueda aplicar anestesia?" onValueChange={() => {}} />
            <Question name="otraEnfermedad" question="¿Padece o ha padecido alguna enfermedad que no se haya mencionado?" onValueChange={() => {}} />
          </div>
        </section>

        {/* Nota de Consentimiento */}
        <section className="space-y-4 rounded-lg border border-border/50 p-4 bg-background/30">
          <h3 className="text-lg font-semibold">NOTA</h3>
          <p className="text-sm text-muted-foreground">
            Los tratamientos odontológicos que deben realizarse en mi boca requieren de materiales especiales y procedimientos complejos. El éxito en odontología es muy alto, no obstante garantizarlo es imposible, los riesgos son mínimos, ya que puede haber accidentes o complicaciones aunque soy atendido por un profesional calificado. Todo lo implicado en los tratamientos que se proponen están basados en la ética y profesionalismo del odontólogo.
          </p>
          <p className="text-sm text-muted-foreground">
            Se hace saber al paciente o a sus padres o tutores que la Dra. Humbelina Huerta Barajas y el Dr. Erick Mancilla Chio son los dueños de la clínica o consultorio dental en el cual usted va a ser atendido. Usted como paciente acepta que no todas sus citas serán atendidas por alguno de ellos y que la responsabilidad del tratamiento será del médico tratante del mismo; ya que los doctores que atienden están contratados por honorarios y será su responsabilidad cada tratamiento.
          </p>
          <p className="text-sm text-muted-foreground">
            Acepto y doy consentimiento de que se me atienda por diferentes médicos, los cuales serán responsables cada uno del tratamiento realizado; liberando a la Dra. Humbelina Huerta Barajas y al Dr. Erick Mancilla Chio de toda responsabilidad de tratamientos no hechos por ellos.
          </p>
        </section>

        <div className="flex justify-end pt-4">
            <Button size="lg" className="neomorphic-hover bg-medical-teal hover:bg-medical-teal/90 text-white font-medium text-lg">Enviar Historia Clínica</Button>
        </div>
      </CardContent>
    </Card>
  );
}
