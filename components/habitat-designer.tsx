"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Box, Cylinder, Html, Environment } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home,
  Plus,
  Trash2,
  AlertCircle,
  DollarSign,
  Save,
  Upload,
  Shield,
  Rocket,
  Layers,
  TrendingUp,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type * as THREE from "three"

// Module type definitions
type ModuleType = "dormitory" | "eclss" | "lab" | "storage" | "airlock" | "greenhouse"

interface ModuleData {
  id: string
  type: ModuleType
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  cost: number // Million USD
  mass: number // kg
  volume: number // m³
}

// Module specifications (mock data)
const MODULE_SPECS: Record<
  ModuleType,
  { name: string; baseCost: number; baseMass: number; baseVolume: number; color: string; geometry: "box" | "cylinder" }
> = {
  dormitory: {
    name: "Dormitory",
    baseCost: 45,
    baseMass: 8000,
    baseVolume: 120,
    color: "#3b82f6",
    geometry: "cylinder",
  },
  eclss: { name: "ECLSS", baseCost: 150, baseMass: 12000, baseVolume: 80, color: "#10b981", geometry: "box" },
  lab: { name: "Laboratory", baseCost: 85, baseMass: 10000, baseVolume: 150, color: "#8b5cf6", geometry: "box" },
  storage: { name: "Storage", baseCost: 25, baseMass: 5000, baseVolume: 60, color: "#f59e0b", geometry: "box" },
  airlock: { name: "Airlock", baseCost: 35, baseMass: 6000, baseVolume: 40, color: "#ef4444", geometry: "cylinder" },
  greenhouse: { name: "Greenhouse", baseCost: 65, baseMass: 9000, baseVolume: 100, color: "#22c55e", geometry: "box" },
}

// AABB Collision Detection
function checkAABBCollision(
  pos1: [number, number, number],
  scale1: number,
  pos2: [number, number, number],
  scale2: number,
  size = 2,
): boolean {
  const halfSize1 = (size * scale1) / 2
  const halfSize2 = (size * scale2) / 2

  return (
    Math.abs(pos1[0] - pos2[0]) < halfSize1 + halfSize2 &&
    Math.abs(pos1[1] - pos2[1]) < halfSize1 + halfSize2 &&
    Math.abs(pos1[2] - pos2[2]) < halfSize1 + halfSize2
  )
}

function ModuleLabel({ module }: { module: ModuleData }) {
  const spec = MODULE_SPECS[module.type]
  return (
    <Html position={[0, 1.5, 0]} center distanceFactor={10}>
      <div className="bg-[#0a0e1a]/90 backdrop-blur-sm text-white px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap pointer-events-none border border-[#176092]/40 shadow-lg">
        <div className="font-semibold text-[#176092]">{spec.name}</div>
        <div className="text-white/80">{Math.round(module.mass)} kg</div>
      </div>
    </Html>
  )
}

// 3D Module Component
function Module({
  module,
  isSelected,
  onClick,
}: {
  module: ModuleData
  isSelected: boolean
  onClick: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const spec = MODULE_SPECS[module.type]

  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <group position={module.position} rotation={module.rotation} scale={module.scale}>
      {spec.geometry === "box" ? (
        <Box ref={meshRef} args={[2, 2, 2]} onClick={onClick}>
          <meshStandardMaterial color={spec.color} opacity={isSelected ? 0.8 : 1} transparent />
        </Box>
      ) : (
        <Cylinder ref={meshRef} args={[1, 1, 2, 32]} onClick={onClick}>
          <meshStandardMaterial color={spec.color} opacity={isSelected ? 0.8 : 1} transparent />
        </Cylinder>
      )}
      {isSelected && (
        <Box args={[2.2, 2.2, 2.2]}>
          <meshBasicMaterial color="#ffff00" wireframe />
        </Box>
      )}
      <ModuleLabel module={module} />
    </group>
  )
}

// Main Habitat Designer Component
export default function HabitatDesigner() {
  const [modules, setModules] = useState<ModuleData[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [collisionError, setCollisionError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("architect")
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true)

  const selectedModule = modules.find((m) => m.id === selectedModuleId)

  // Cost calculations
  const COST_PER_KG_TO_MARS = 75000 // USD per kg
  const BASE_HABITAT_MASS = 10000 // kg

  const totalHardwareCost = useMemo(() => {
    return modules.reduce((sum, m) => sum + m.cost, 0)
  }, [modules])

  const totalMass = useMemo(() => {
    return BASE_HABITAT_MASS + modules.reduce((sum, m) => sum + m.mass, 0)
  }, [modules])

  const totalLaunchCost = useMemo(() => {
    return (totalMass * COST_PER_KG_TO_MARS) / 1_000_000 // Convert to millions
  }, [totalMass])

  const totalCost = totalHardwareCost + totalLaunchCost

  const totalVolume = useMemo(() => {
    return modules.reduce((sum, m) => sum + m.volume, 0)
  }, [modules])

  const saveDesign = () => {
    const designData = {
      modules,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("mars-architect-design", JSON.stringify(designData))
    alert("Design saved successfully!")
  }

  const loadDesign = () => {
    const saved = localStorage.getItem("mars-architect-design")
    if (saved) {
      try {
        const designData = JSON.parse(saved)
        setModules(designData.modules)
        setSelectedModuleId(null)
        alert(`Design loaded from ${new Date(designData.timestamp).toLocaleString()}`)
      } catch (e) {
        alert("Failed to load design")
      }
    } else {
      alert("No saved design found")
    }
  }

  // Add module
  const addModule = (type: ModuleType) => {
    const spec = MODULE_SPECS[type]
    const newModule: ModuleData = {
      id: `${type}-${Date.now()}`,
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
      cost: spec.baseCost,
      mass: spec.baseMass,
      volume: spec.baseVolume,
    }

    // Check collision with existing modules
    const hasCollision = modules.some((m) =>
      checkAABBCollision(newModule.position, newModule.scale, m.position, m.scale),
    )

    if (hasCollision) {
      setCollisionError("Collision Error! Geometry overlap not permitted.")
      setTimeout(() => setCollisionError(null), 3000)
      return
    }

    setModules([...modules, newModule])
    setSelectedModuleId(newModule.id)
  }

  // Delete module
  const deleteModule = (id: string) => {
    setModules(modules.filter((m) => m.id !== id))
    if (selectedModuleId === id) {
      setSelectedModuleId(null)
    }
  }

  // Update module position
  const updateModulePosition = (axis: "x" | "y" | "z", value: number) => {
    if (!selectedModule) return

    const newPosition: [number, number, number] = [...selectedModule.position]
    const axisIndex = { x: 0, y: 1, z: 2 }[axis]
    newPosition[axisIndex] = value

    // Check collision
    const hasCollision = modules.some(
      (m) => m.id !== selectedModule.id && checkAABBCollision(newPosition, selectedModule.scale, m.position, m.scale),
    )

    if (hasCollision) {
      setCollisionError("Collision Error! Geometry overlap not permitted.")
      setTimeout(() => setCollisionError(null), 3000)
      return
    }

    setModules(modules.map((m) => (m.id === selectedModule.id ? { ...m, position: newPosition } : m)))
  }

  // Update module rotation
  const updateModuleRotation = (axis: "x" | "y" | "z", degrees: number) => {
    if (!selectedModule) return

    const radians = (degrees * Math.PI) / 180
    const newRotation: [number, number, number] = [...selectedModule.rotation]
    const axisIndex = { x: 0, y: 1, z: 2 }[axis]
    newRotation[axisIndex] = radians

    setModules(modules.map((m) => (m.id === selectedModule.id ? { ...m, rotation: newRotation } : m)))
  }

  // Update module scale
  const updateModuleScale = (scale: number) => {
    if (!selectedModule) return

    // Check collision with new scale
    const hasCollision = modules.some(
      (m) => m.id !== selectedModule.id && checkAABBCollision(selectedModule.position, scale, m.position, m.scale),
    )

    if (hasCollision) {
      setCollisionError("Collision Error! Geometry overlap not permitted.")
      setTimeout(() => setCollisionError(null), 3000)
      return
    }

    const spec = MODULE_SPECS[selectedModule.type]
    const volumeRatio = Math.pow(scale, 3)

    setModules(
      modules.map((m) =>
        m.id === selectedModule.id
          ? {
              ...m,
              scale,
              cost: spec.baseCost * volumeRatio,
              mass: spec.baseMass * volumeRatio,
              volume: spec.baseVolume * volumeRatio,
            }
          : m,
      ),
    )
  }

  const radiationShielding = useMemo(() => {
    // Mock calculation: more modules = better shielding
    const shieldingScore = modules.length * 15 + totalMass / 1000
    const required = 200
    return { score: shieldingScore, required, pass: shieldingScore >= required }
  }, [modules, totalMass])

  const structuralLoad = useMemo(() => {
    // Mock calculation: pressure from regolith covering
    const pressure = (totalMass / 100) * 1.5 // kPa
    const limit = 350
    return { pressure, limit, pass: pressure <= limit }
  }, [totalMass])

  const nhvCompliance = useMemo(() => {
    // NASA requirement: 115.83 m³ for 4 crew long duration
    const required = 115.83
    return { actual: totalVolume, required, pass: totalVolume >= required }
  }, [totalVolume])

  const logistics = useMemo(() => {
    const dryMass = totalMass
    const propellantMass = dryMass * 4 // 4:1 propellant ratio
    const totalDeliveryMass = dryMass + propellantMass

    return {
      vehicle: totalMass > 50000 ? "Starship HLS Variant" : "Ares V Heavy Lift",
      launchWindow: "2031 Q1",
      secondaryWindow: "2033 Q3",
      structureMass: Math.round(dryMass * 0.6),
      payloadMass: Math.round(dryMass * 0.4),
      propellantMass: Math.round(propellantMass),
      totalDeliveryMass: Math.round(totalDeliveryMass),
    }
  }, [totalMass])

  return (
    <div className="h-screen flex flex-col bg-[#0a0e1a]">
      <header className="border-b border-white/10 bg-[#0f1419]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Home className="w-6 h-6 text-[#176092]" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Mars Architect</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={saveDesign}
            className="bg-[#176092] hover:bg-[#1a75a8] text-white border-[#176092]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDesign}
            className="bg-[#176092] hover:bg-[#1a75a8] text-white border-[#176092]"
          >
            <Upload className="w-4 h-4 mr-2" />
            Load
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Back to Landing
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative">
          {collisionError && (
            <Alert className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-96 bg-[#ef4444]/90 backdrop-blur-sm text-white border-[#ef4444]">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">{collisionError}</AlertDescription>
            </Alert>
          )}
          <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Environment preset="sunset" />
            <fog attach="fog" args={["#d4a574", 20, 100]} />
            <OrbitControls />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
              <planeGeometry args={[50, 50]} />
              <meshStandardMaterial color="#c1440e" roughness={0.9} />
            </mesh>

            {/* Grid */}
            <gridHelper args={[50, 50, "#8b4513", "#5c2e0a"]} position={[0, -2, 0]} />

            {/* Modules */}
            {modules.map((module) => (
              <Module
                key={module.id}
                module={module}
                isSelected={module.id === selectedModuleId}
                onClick={() => setSelectedModuleId(module.id)}
              />
            ))}
          </Canvas>
        </div>

        <Button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-24 w-8 rounded-l-lg rounded-r-none bg-[#176092] hover:bg-[#1a75a8] border-2 border-r-0 border-[#176092] shadow-2xl transition-all duration-300 flex items-center justify-center p-0"
          style={{
            right: sidebarVisible ? "384px" : "0px",
          }}
        >
          {sidebarVisible ? (
            <ChevronRight className="w-5 h-5 text-white" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-white" />
          )}
        </Button>

        {sidebarVisible && (
          <div className="w-96 border-l border-white/10 bg-[#0f1419]/60 backdrop-blur-xl flex flex-col shadow-2xl transition-all duration-300">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-full">
              <TabsList className="w-full grid grid-cols-4 bg-[#0a0e1a]/80 border-b border-white/10 rounded-none h-14 p-0">
                <TabsTrigger
                  value="architect"
                  className="data-[state=active]:bg-[#176092] data-[state=active]:text-white rounded-none flex flex-col items-center gap-1 py-2"
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-xs">Architect</span>
                </TabsTrigger>
                <TabsTrigger
                  value="economics"
                  className="data-[state=active]:bg-[#176092] data-[state=active]:text-white rounded-none flex flex-col items-center gap-1 py-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Economics</span>
                </TabsTrigger>
                <TabsTrigger
                  value="validation"
                  className="data-[state=active]:bg-[#176092] data-[state=active]:text-white rounded-none flex flex-col items-center gap-1 py-2"
                >
                  <FlaskConical className="w-4 h-4" />
                  <span className="text-xs">Validation</span>
                </TabsTrigger>
                <TabsTrigger
                  value="logistics"
                  className="data-[state=active]:bg-[#176092] data-[state=active]:text-white rounded-none flex flex-col items-center gap-1 py-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span className="text-xs">Logistics</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="architect" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Module Spawning */}
                    <div>
                      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
                        <Plus className="w-5 h-5 text-[#176092]" />
                        Add Modules
                      </h2>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(MODULE_SPECS).map(([type, spec]) => (
                          <Button
                            key={type}
                            variant="outline"
                            size="sm"
                            onClick={() => addModule(type as ModuleType)}
                            className="justify-start bg-white/5 hover:bg-[#176092]/20 border-white/10 text-white"
                          >
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: spec.color }} />
                            {spec.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Module List */}
                    <div>
                      <h2 className="text-lg font-semibold mb-3 text-white">Modules ({modules.length})</h2>
                      <div className="space-y-2">
                        {modules.map((module) => {
                          const spec = MODULE_SPECS[module.type]
                          return (
                            <Card
                              key={module.id}
                              className={`p-3 cursor-pointer transition-all bg-white/5 hover:bg-white/10 border-white/10 ${
                                module.id === selectedModuleId ? "ring-2 ring-[#176092] bg-[#176092]/10" : ""
                              }`}
                              onClick={() => setSelectedModuleId(module.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: spec.color }} />
                                  <span className="font-medium text-sm text-white">{spec.name}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteModule(module.id)
                                  }}
                                  className="hover:bg-[#ef4444]/20 text-white/70 hover:text-white"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          )
                        })}
                      </div>
                    </div>

                    {selectedModule && (
                      <>
                        <Separator className="bg-white/10" />
                        <div>
                          <h2 className="text-lg font-semibold mb-4 text-white">Coordinate Controls</h2>

                          {/* Position Controls */}
                          <div className="space-y-4 mb-6">
                            <h3 className="text-sm font-medium text-[#176092]">Position (meters)</h3>
                            {(["x", "y", "z"] as const).map((axis) => {
                              const axisIndex = { x: 0, y: 1, z: 2 }[axis]
                              return (
                                <div key={axis} className="space-y-2">
                                  <Label className="text-xs uppercase text-white/70">{axis}-Axis</Label>
                                  <div className="flex gap-2">
                                    <Slider
                                      value={[selectedModule.position[axisIndex]]}
                                      onValueChange={([value]) => updateModulePosition(axis, value)}
                                      min={-20}
                                      max={20}
                                      step={0.5}
                                      className="flex-1"
                                    />
                                    <Input
                                      type="number"
                                      value={selectedModule.position[axisIndex].toFixed(1)}
                                      onChange={(e) =>
                                        updateModulePosition(axis, Number.parseFloat(e.target.value) || 0)
                                      }
                                      className="w-20 bg-white/5 border-white/10 text-white text-center"
                                      step={0.5}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Rotation Controls */}
                          <div className="space-y-4 mb-6">
                            <h3 className="text-sm font-medium text-[#176092]">Rotation (degrees)</h3>
                            {(["x", "y", "z"] as const).map((axis) => {
                              const axisIndex = { x: 0, y: 1, z: 2 }[axis]
                              const degrees = (selectedModule.rotation[axisIndex] * 180) / Math.PI
                              const label = { x: "Pitch", y: "Yaw", z: "Roll" }[axis]
                              return (
                                <div key={axis} className="space-y-2">
                                  <Label className="text-xs uppercase text-white/70">
                                    {label} ({axis})
                                  </Label>
                                  <div className="flex gap-2">
                                    <Slider
                                      value={[degrees]}
                                      onValueChange={([value]) => updateModuleRotation(axis, value)}
                                      min={-180}
                                      max={180}
                                      step={15}
                                      className="flex-1"
                                    />
                                    <Input
                                      type="number"
                                      value={degrees.toFixed(0)}
                                      onChange={(e) =>
                                        updateModuleRotation(axis, Number.parseFloat(e.target.value) || 0)
                                      }
                                      className="w-20 bg-white/5 border-white/10 text-white text-center"
                                      step={15}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Scale Control */}
                          <div className="space-y-2">
                            <Label className="text-xs uppercase text-white/70">Scale</Label>
                            <div className="flex gap-2">
                              <Slider
                                value={[selectedModule.scale]}
                                onValueChange={([value]) => updateModuleScale(value)}
                                min={0.5}
                                max={2}
                                step={0.1}
                                className="flex-1"
                              />
                              <Input
                                type="number"
                                value={selectedModule.scale.toFixed(1)}
                                onChange={(e) => updateModuleScale(Number.parseFloat(e.target.value) || 1)}
                                className="w-20 bg-white/5 border-white/10 text-white text-center"
                                step={0.1}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="economics" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                        <DollarSign className="w-5 h-5 text-[#176092]" />
                        Economic Analysis
                      </h2>
                      <Card className="p-5 space-y-4 bg-[#176092]/10 border-[#176092]/30 backdrop-blur-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/70">Hardware Cost:</span>
                          <span className="font-semibold text-white text-lg">${totalHardwareCost.toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/70">Total Mass:</span>
                          <span className="font-semibold text-white text-lg">{totalMass.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/70">Launch Cost:</span>
                          <span className="font-semibold text-white text-lg">${totalLaunchCost.toFixed(1)}M</span>
                        </div>
                        <Separator className="bg-white/20" />
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-semibold text-white">Total Mission Cost:</span>
                          <span className="text-2xl font-bold text-[#176092]">${(totalCost / 1000).toFixed(2)}B</span>
                        </div>
                      </Card>
                      <p className="text-xs text-white/50 mt-4">
                        * Based on $75,000/kg launch cost and NASA reference data
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="validation" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                        <Shield className="w-5 h-5 text-[#176092]" />
                        Mission Resilience Tests
                      </h2>

                      <div className="space-y-4">
                        {/* Test 1: Radiation Shielding */}
                        <Card
                          className={`p-4 border ${radiationShielding.pass ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}
                        >
                          <h3 className="font-semibold mb-2 text-white">Test 1: Radiation Shielding Adequacy</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/70">Shielding Score:</span>
                              <span className="font-medium text-white">{radiationShielding.score.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Required:</span>
                              <span className="font-medium text-white">{radiationShielding.required}</span>
                            </div>
                            <Separator className="bg-white/20" />
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-white">Status:</span>
                              <span
                                className={`font-bold ${radiationShielding.pass ? "text-green-400" : "text-red-400"}`}
                              >
                                {radiationShielding.pass ? "PASS" : "FAIL - CRITICAL"}
                              </span>
                            </div>
                            {!radiationShielding.pass && (
                              <Alert className="mt-2 bg-red-500/20 border-red-500/50">
                                <AlertCircle className="h-4 w-4 text-red-400" />
                                <AlertDescription className="text-xs text-white">
                                  Unacceptable Radiation Dose Risk (Crew Health Failure)
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </Card>

                        {/* Test 2: Structural Load */}
                        <Card
                          className={`p-4 border ${structuralLoad.pass ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}
                        >
                          <h3 className="font-semibold mb-2 text-white">Test 2: Structural Load Stability</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/70">Structural Pressure:</span>
                              <span className="font-medium text-white">{structuralLoad.pressure.toFixed(1)} kPa</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Limit:</span>
                              <span className="font-medium text-white">{structuralLoad.limit} kPa</span>
                            </div>
                            <Separator className="bg-white/20" />
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-white">Status:</span>
                              <span className={`font-bold ${structuralLoad.pass ? "text-green-400" : "text-red-400"}`}>
                                {structuralLoad.pass ? "PASS" : "FAIL"}
                              </span>
                            </div>
                          </div>
                        </Card>

                        {/* Test 3: NHV Compliance */}
                        <Card
                          className={`p-4 border ${nhvCompliance.pass ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}
                        >
                          <h3 className="font-semibold mb-2 text-white">
                            Test 3: Net Habitable Volume (NHV) Compliance
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/70">Actual Volume:</span>
                              <span className="font-medium text-white">{nhvCompliance.actual.toFixed(2)} m³</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Required (4 crew):</span>
                              <span className="font-medium text-white">{nhvCompliance.required} m³</span>
                            </div>
                            <Separator className="bg-white/20" />
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-white">Status:</span>
                              <span className={`font-bold ${nhvCompliance.pass ? "text-green-400" : "text-red-400"}`}>
                                {nhvCompliance.pass ? "PASS" : "FAIL"}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </div>

                      <p className="text-xs text-white/50 mt-4">
                        * Tests based on NASA Technical Standards for long-duration Mars missions
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="logistics" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                        <Rocket className="w-5 h-5 text-[#176092]" />
                        Mission Logistics & Delivery
                      </h2>

                      <Card className="p-5 space-y-4 bg-[#176092]/10 border-[#176092]/30 backdrop-blur-sm">
                        <div>
                          <h3 className="font-semibold mb-2 text-white">Primary Transit Vehicle</h3>
                          <p className="text-lg font-bold text-[#176092]">{logistics.vehicle}</p>
                        </div>

                        <Separator className="bg-white/20" />

                        <div>
                          <h3 className="font-semibold mb-2 text-white">Estimated Launch Windows</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/70">Optimal Launch:</span>
                              <span className="font-medium text-white">{logistics.launchWindow}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Secondary Window:</span>
                              <span className="font-medium text-white">{logistics.secondaryWindow}</span>
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-white/20" />

                        <div>
                          <h3 className="font-semibold mb-2 text-white">Delivery Mass Breakdown</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/70">Structure Mass:</span>
                              <span className="font-medium text-white">
                                {logistics.structureMass.toLocaleString()} kg
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Payload Mass:</span>
                              <span className="font-medium text-white">
                                {logistics.payloadMass.toLocaleString()} kg
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/70">Propellant Mass (4:1 ratio):</span>
                              <span className="font-medium text-white">
                                {logistics.propellantMass.toLocaleString()} kg
                              </span>
                            </div>
                            <Separator className="bg-white/20" />
                            <div className="flex justify-between items-center pt-2">
                              <span className="font-semibold text-white">Total Delivery Mass:</span>
                              <span className="text-xl font-bold text-[#176092]">
                                {logistics.totalDeliveryMass.toLocaleString()} kg
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <p className="text-xs text-white/50 mt-4">
                        * Launch windows based on Hohmann transfer orbits. Propellant mass calculated using standard 4:1
                        ratio for Mars transit.
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
