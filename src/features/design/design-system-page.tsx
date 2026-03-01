import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  MailIcon,
  PlusIcon,
  SettingsIcon,
  StarIcon,
  TrashIcon,
  UserIcon,
} from 'lucide-react'

import {
  BentoCard,
  BentoCardContent,
  BentoCardDescription,
  BentoCardTitle,
} from '~/components/ui/bento-grid'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import { Switch } from '~/components/ui/switch'
import { Progress } from '~/components/ui/progress'
import { Slider } from '~/components/ui/slider'
import { Skeleton } from '~/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Toggle } from '~/components/ui/toggle'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { PageLayout } from '~/components/page-layout'
import { Header } from '~/components/header'
import { ThemeToggle } from '~/components/theme-toggle'

const ease = [0.16, 1, 0.3, 1] as const

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease },
  },
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease },
  },
}

function ColorSwatch({ name, variable }: { name: string; variable: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="size-8 rounded-md border shadow-sm"
        style={{ backgroundColor: `var(--${variable})` }}
      />
      <span className="text-xs text-muted-foreground">{name}</span>
    </div>
  )
}

export function DesignSystemPage() {
  const [progress, setProgress] = useState(0)
  const [switchOn, setSwitchOn] = useState(true)
  const [sliderValue, setSliderValue] = useState([50])

  useEffect(() => {
    const timer = setTimeout(() => setProgress(60), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
    <Header />
    <TooltipProvider>
      <PageLayout
        title="Design System"
        subtitle="base-nova / neutral / hugeicons + depth enhancements"
        headerActions={<ThemeToggle />}
        showBack
      >
        <motion.div
          className="grid auto-rows-[minmax(140px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          variants={gridVariants}
          initial="hidden"
          animate="show"
        >
          {/* Colors */}
          <motion.div variants={cardVariants} className="sm:col-span-2">
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Theme Colors</BentoCardTitle>
                <BentoCardDescription>
                  Tinted backgrounds, not pure black/white
                </BentoCardDescription>
                <div className="mt-3 flex flex-wrap gap-3">
                  <ColorSwatch name="bg" variable="background" />
                  <ColorSwatch name="fg" variable="foreground" />
                  <ColorSwatch name="primary" variable="primary" />
                  <ColorSwatch name="secondary" variable="secondary" />
                  <ColorSwatch name="muted" variable="muted" />
                  <ColorSwatch name="accent" variable="accent" />
                  <ColorSwatch name="destructive" variable="destructive" />
                </div>
                <div className="mt-3 flex gap-2">
                  <ColorSwatch name="chart-1" variable="chart-1" />
                  <ColorSwatch name="chart-2" variable="chart-2" />
                  <ColorSwatch name="chart-3" variable="chart-3" />
                  <ColorSwatch name="chart-4" variable="chart-4" />
                  <ColorSwatch name="chart-5" variable="chart-5" />
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Depth System */}
          <motion.div variants={cardVariants} className="sm:col-span-2">
            <BentoCard elevated className="h-full bg-primary text-primary-foreground">
              <BentoCardContent>
                <BentoCardTitle className="text-sm text-primary-foreground">Depth System</BentoCardTitle>
                <BentoCardDescription className="text-primary-foreground/80">
                  Pure drop shadows, no white glow
                </BentoCardDescription>
                <div className="mt-3 flex flex-wrap gap-3 text-foreground">
                  <div className="shadow-depth-1 rounded-lg bg-card p-3 text-xs">
                    Level 1
                  </div>
                  <div className="shadow-depth-2 rounded-lg bg-card p-3 text-xs">
                    Level 2
                  </div>
                  <div className="shadow-depth-3 rounded-lg bg-card p-3 text-xs">
                    Level 3
                  </div>
                  <div className="shadow-depth-4 rounded-lg bg-card p-3 text-xs">
                    Level 4
                  </div>
                  <div className="shadow-depth-5 rounded-lg bg-card p-3 text-xs">
                    Level 5
                  </div>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Elevated Buttons */}
          <motion.div variants={cardVariants} className="sm:col-span-2 row-span-2">
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Buttons</BentoCardTitle>
                <BentoCardDescription>
                  Use <code className="rounded bg-muted px-1 text-xs">elevated</code>{' '}
                  prop for premium CTAs
                </BentoCardDescription>
                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Default</Button>
                    <Button size="sm" variant="secondary">
                      Secondary
                    </Button>
                    <Button size="sm" variant="outline">
                      Outline
                    </Button>
                    <Button size="sm" variant="ghost">
                      Ghost
                    </Button>
                    <Button size="sm" variant="destructive">
                      Destructive
                    </Button>
                  </div>
                  <div className="border-t pt-3">
                    <p className="mb-2 text-xs text-muted-foreground">
                      Elevated buttons (hover for lift effect):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button elevated>Elevated Primary</Button>
                      <Button elevated variant="secondary">
                        Elevated Secondary
                      </Button>
                      <Button elevated variant="outline">
                        Elevated Outline
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon-xs" elevated>
                      <PlusIcon />
                    </Button>
                    <Button size="icon-sm" elevated>
                      <PlusIcon />
                    </Button>
                    <Button size="icon" elevated>
                      <PlusIcon />
                    </Button>
                    <Button size="icon-lg" elevated>
                      <PlusIcon />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" elevated>
                      <MailIcon data-icon="inline-start" /> Send
                    </Button>
                    <Button size="sm" variant="outline" elevated>
                      Continue <ChevronRightIcon data-icon="inline-end" />
                    </Button>
                  </div>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Cards with Elevation Levels */}
          <motion.div variants={cardVariants} className="sm:col-span-2 row-span-2">
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Card Elevation Levels</BentoCardTitle>
                <BentoCardDescription>
                  Use <code className="rounded bg-muted px-1 text-xs">elevated={'{1-4}'}</code>{' '}
                  for increasing 3D pop effect
                </BentoCardDescription>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Card size="sm">
                    <CardHeader>
                      <CardTitle>Default</CardTitle>
                      <CardDescription>No elevation</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card size="sm" elevated={1}>
                    <CardHeader>
                      <CardTitle>Level 1</CardTitle>
                      <CardDescription>Subtle lift</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card size="sm" elevated={2}>
                    <CardHeader>
                      <CardTitle>Level 2</CardTitle>
                      <CardDescription>Default elevated</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card size="sm" elevated={3}>
                    <CardHeader>
                      <CardTitle>Level 3</CardTitle>
                      <CardDescription>More prominent</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card size="sm" elevated={4}>
                    <CardHeader>
                      <CardTitle>Level 4</CardTitle>
                      <CardDescription>Maximum pop</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card size="sm" elevated={3} interactive>
                    <CardHeader>
                      <CardTitle>Interactive</CardTitle>
                      <CardDescription>Hover for lift</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Badges */}
          <motion.div variants={cardVariants}>
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Badges</BentoCardTitle>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
                <div className="mt-2 flex gap-2">
                  <Badge>
                    <StarIcon data-icon="inline-start" /> Featured
                  </Badge>
                  <Badge variant="secondary">
                    <CheckIcon data-icon="inline-start" /> Done
                  </Badge>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Avatars */}
          <motion.div variants={cardVariants}>
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Avatars</BentoCardTitle>
                <div className="mt-3 flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-xs">XS</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar className="size-10">
                    <AvatarFallback>MD</AvatarFallback>
                  </Avatar>
                  <Avatar className="size-12">
                    <AvatarFallback>
                      <UserIcon className="size-5" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Enhanced Inputs */}
          <motion.div variants={cardVariants} className="sm:col-span-2">
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Enhanced Inputs</BentoCardTitle>
                <BentoCardDescription>
                  Use <code className="rounded bg-muted px-1 text-xs">enhanced</code>{' '}
                  prop for premium inset shadow
                </BentoCardDescription>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="normal" className="text-xs">
                      Normal Input
                    </Label>
                    <Input id="normal" placeholder="Standard input" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="enhanced" className="text-xs">
                      Enhanced Input
                    </Label>
                    <Input id="enhanced" enhanced placeholder="With inset shadow" />
                  </div>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Textarea Enhanced */}
          <motion.div variants={cardVariants}>
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Textarea</BentoCardTitle>
                <div className="mt-3">
                  <Textarea
                    enhanced
                    placeholder="Enhanced textarea..."
                    className="min-h-12 resize-none"
                  />
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Selection Controls */}
          <motion.div variants={cardVariants}>
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Selection</BentoCardTitle>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="c1" defaultChecked />
                    <Label htmlFor="c1" className="text-xs">
                      Checkbox
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
                    <Label className="text-xs">{switchOn ? 'On' : 'Off'}</Label>
                  </div>
                  <RadioGroup defaultValue="r1" className="flex gap-3">
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="r1" id="r1" />
                      <Label htmlFor="r1" className="text-xs">
                        A
                      </Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="r2" id="r2" />
                      <Label htmlFor="r2" className="text-xs">
                        B
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Slider & Progress */}
          <motion.div variants={cardVariants}>
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Slider & Progress</BentoCardTitle>
                <div className="mt-3 space-y-4">
                  <div className="space-y-2">
                    <Slider value={sliderValue} onValueChange={setSliderValue} max={100} />
                    <p className="text-xs text-muted-foreground">Value: {sliderValue[0]}</p>
                  </div>
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <div className="flex gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setProgress(Math.max(0, progress - 20))}
                      >
                        -
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setProgress(Math.min(100, progress + 20))}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Toggles */}
          <motion.div variants={cardVariants}>
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Toggles</BentoCardTitle>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Toggle size="sm" aria-label="Star">
                    <StarIcon className="size-4" />
                  </Toggle>
                  <Toggle size="sm" variant="outline" aria-label="Bell">
                    <BellIcon className="size-4" />
                  </Toggle>
                  <Toggle size="sm" defaultPressed aria-label="Settings">
                    <SettingsIcon className="size-4" />
                  </Toggle>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Elevated Tabs */}
          <motion.div variants={cardVariants} className="sm:col-span-2">
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Elevated Tabs</BentoCardTitle>
                <BentoCardDescription>
                  Use <code className="rounded bg-muted px-1 text-xs">elevated</code> on
                  TabsTrigger
                </BentoCardDescription>
                <div className="mt-3">
                  <Tabs defaultValue="tab1">
                    <TabsList>
                      <TabsTrigger value="tab1" elevated>
                        Account
                      </TabsTrigger>
                      <TabsTrigger value="tab2" elevated>
                        Password
                      </TabsTrigger>
                      <TabsTrigger value="tab3" elevated>
                        Settings
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent
                      value="tab1"
                      className="mt-2 rounded-md bg-muted/50 p-3 text-xs"
                    >
                      Active tab has premium shadow elevation.
                    </TabsContent>
                    <TabsContent
                      value="tab2"
                      className="mt-2 rounded-md bg-muted/50 p-3 text-xs"
                    >
                      Password settings content.
                    </TabsContent>
                    <TabsContent
                      value="tab3"
                      className="mt-2 rounded-md bg-muted/50 p-3 text-xs"
                    >
                      Configuration preferences.
                    </TabsContent>
                  </Tabs>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Alerts */}
          <motion.div variants={cardVariants} className="sm:col-span-2">
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Alerts</BentoCardTitle>
                <div className="mt-3 space-y-2">
                  <Alert className="py-2">
                    <BellIcon className="size-4" />
                    <AlertTitle className="text-xs">Notice</AlertTitle>
                    <AlertDescription className="text-xs">
                      This is an informational alert.
                    </AlertDescription>
                  </Alert>
                  <Alert variant="destructive" className="py-2">
                    <TrashIcon className="size-4" />
                    <AlertTitle className="text-xs">Error</AlertTitle>
                    <AlertDescription className="text-xs">
                      Something went wrong.
                    </AlertDescription>
                  </Alert>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Overlays with Depth */}
          <motion.div variants={cardVariants} className="sm:col-span-2">
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Overlay Depth Hierarchy</BentoCardTitle>
                <BentoCardDescription>
                  Dialog (L5) &gt; Sheet (L4) &gt; Popover (L3) &gt; Tooltip (L2)
                </BentoCardDescription>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        Dialog (L5)
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modal Dialog</DialogTitle>
                        <DialogDescription>
                          Level 5 depth - highest elevation for modals.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                        <Button size="sm" elevated>
                          Confirm
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button size="sm" variant="outline">
                        Sheet (L4)
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Sheet Panel</SheetTitle>
                        <SheetDescription>
                          Level 4 depth for drawers and sheets.
                        </SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="sm" variant="outline">
                        Popover (L3)
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <p className="text-sm">Level 3 depth for popovers and dropdowns.</p>
                    </PopoverContent>
                  </Popover>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="outline">
                        Tooltip (L2)
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Level 2 depth</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* BentoCard Elevation Levels */}
          <motion.div variants={cardVariants}>
            <BentoCard elevated={1} className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Bento Level 1</BentoCardTitle>
                <BentoCardDescription>Subtle 3D lift</BentoCardDescription>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          <motion.div variants={cardVariants}>
            <BentoCard elevated={2} className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Bento Level 2</BentoCardTitle>
                <BentoCardDescription>Default elevation</BentoCardDescription>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          <motion.div variants={cardVariants}>
            <BentoCard elevated={3} interactive className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Bento Level 3</BentoCardTitle>
                <BentoCardDescription>Interactive + prominent</BentoCardDescription>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          <motion.div variants={cardVariants}>
            <BentoCard elevated={4} className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Bento Level 4</BentoCardTitle>
                <BentoCardDescription>Maximum pop effect</BentoCardDescription>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Skeleton */}
          <motion.div variants={cardVariants}>
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Skeleton</BentoCardTitle>
                <div className="mt-3 flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Typography */}
          <motion.div variants={cardVariants} className="sm:col-span-2">
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Typography</BentoCardTitle>
                <BentoCardDescription>
                  Headlines &gt;60px should use negative tracking (-0.02em)
                </BentoCardDescription>
                <div className="mt-3 space-y-1">
                  <p className="text-2xl font-bold tracking-tighter">
                    Large Heading
                  </p>
                  <p className="text-base">
                    Body text with <strong>bold</strong>, <em>italic</em>, and{' '}
                    <code className="rounded bg-muted px-1 text-xs">code</code>.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Muted secondary text for descriptions.
                  </p>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>

          {/* Select */}
          <motion.div variants={cardVariants}>
            <BentoCard className="h-full">
              <BentoCardContent>
                <BentoCardTitle className="text-sm">Select</BentoCardTitle>
                <div className="mt-3">
                  <Select defaultValue="opt1">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opt1">Option 1</SelectItem>
                      <SelectItem value="opt2">Option 2</SelectItem>
                      <SelectItem value="opt3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </BentoCardContent>
            </BentoCard>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-muted-foreground"
          variants={fadeUpVariants}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.9, duration: 0.5, ease }}
        >
          shadcn/ui &bull; base-nova style &bull; neutral base &bull; hugeicons &bull;
          depth system enhancements
        </motion.p>
      </PageLayout>
    </TooltipProvider>
    </>
  )
}
