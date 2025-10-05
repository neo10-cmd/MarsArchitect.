"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import HabitatDesigner from "@/components/habitat-designer"
import { Rocket, Building2, Shield, Calculator } from "lucide-react"

export default function MarsArchitectPage() {
  const [showSimulator, setShowSimulator] = useState(false)

  if (showSimulator) {
    return <HabitatDesigner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 opacity-10 bg-[url('/mars-surface.png')]"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Rocket className="w-4 h-4" />
            <span>NASA-Validated Engineering</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
            Mars Architect: Extreme Architecture Simulation
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto">
            Design, validate, and estimate costs for deep space habitats based on NASA guidelines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => setShowSimulator(true)}>
              Start Designing
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Section 1: Scientific Foundation */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Calculator className="w-8 h-8 text-primary" />
            <h2 className="text-4xl font-bold">Engineering Habitats and the Volume Factor (NHV)</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-lg leading-relaxed text-muted-foreground">
                The design of deep space habitats requires precise calculation of{" "}
                <strong className="text-foreground">Net Habitable Volume (NHV)</strong> - the actual usable space
                available to crew members after accounting for equipment, storage, and life support systems.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Mass efficiency is critical: every kilogram launched to Mars costs approximately{" "}
                <strong className="text-foreground">$75,000 USD</strong>. Optimizing the volume-to-mass ratio directly
                impacts mission feasibility and cost.
              </p>
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold text-lg mb-2">Key Metrics</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Minimum NHV per crew member: 25-30 m³</li>
                  <li>• Optimal pressure vessel efficiency: 0.6-0.8</li>
                  <li>• Radiation shielding requirement: 20-40 g/cm²</li>
                </ul>
              </Card>
            </div>
            <div className="space-y-4">
              <img
                src="/space-habitat-interior-volume-diagram.jpg"
                alt="Habitat Volume Diagram"
                className="w-full rounded-lg shadow-lg"
              />
              <p className="text-sm text-muted-foreground italic">
                Reference: NASA Technical Paper 2015-218564, "Habitable Volume Requirements for Long-Duration Space
                Missions"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Construction Technologies */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="w-8 h-8 text-primary" />
            <h2 className="text-4xl font-bold">Softgoods (Inflatable) vs. Autonomous Construction (MMPACT)</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Inflatables */}
            <Card className="p-8 space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-semibold">Inflatable Structures</h3>
              </div>
              <img src="/inflatable-space-habitat-module.jpg" alt="Inflatable Habitat" className="w-full rounded-lg" />
              <p className="text-muted-foreground leading-relaxed">
                Softgoods technology dramatically reduces launch volume through compact folding. Multi-layer fabric
                systems provide:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  • <strong className="text-foreground">MMOD Protection:</strong> Kevlar and Nextel layers shield
                  against micrometeoroid impacts
                </li>
                <li>
                  • <strong className="text-foreground">Volume Efficiency:</strong> 10:1 expansion ratio from launch to
                  deployed state
                </li>
                <li>
                  • <strong className="text-foreground">Mass Savings:</strong> 40-60% lighter than rigid structures
                </li>
                <li>
                  • <strong className="text-foreground">Proven Technology:</strong> BEAM module operational on ISS since
                  2016
                </li>
              </ul>
            </Card>

            {/* MMPACT */}
            <Card className="p-8 space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-semibold">Autonomous Construction (MMPACT)</h3>
              </div>
              <img src="/3d-printed-mars-habitat-construction.jpg" alt="MMPACT Construction" className="w-full rounded-lg" />
              <p className="text-muted-foreground leading-relaxed">
                MMPACT (Modular Martian Printed Architecture Construction Technology) enables in-situ resource
                utilization:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  • <strong className="text-foreground">Regolith Printing:</strong> 3D-printed structures using local
                  Martian soil
                </li>
                <li>
                  • <strong className="text-foreground">Radiation Shielding:</strong> Thick walls provide superior
                  protection
                </li>
                <li>
                  • <strong className="text-foreground">Scalability:</strong> Autonomous robots construct habitats
                  before crew arrival
                </li>
                <li>
                  • <strong className="text-foreground">Durability:</strong> Permanent structures resistant to dust
                  storms
                </li>
              </ul>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" className="text-lg px-12 py-6" onClick={() => setShowSimulator(true)}>
              <Rocket className="w-5 h-5 mr-2" />
              Launch 3D Simulator
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p className="text-sm">Mars Architect © 2025 | Based on NASA Technical Standards and Research</p>
        </div>
      </footer>
    </div>
  )
}
