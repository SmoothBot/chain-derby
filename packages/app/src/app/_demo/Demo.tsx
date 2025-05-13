import { SideBar } from "@/components/SideBar";
import {
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { SampleComponents } from "./Components";
import { SkeletonStack } from "./SkeletonStack";
import { WhatIsSkeleton } from "./WhatIsSkeleton";
import { FontStyles } from "./FontStyles";

export function Demo() {
  return (
    <div className="h-full">
      <SideBar />
      <div id="demo-content" className="h-full">
        <Card className="h-full p-4">
          <Tabs defaultValue="intro">
            <TabsList className="space-x-1">
              <TabsTrigger value="intro">Introduction</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="fonts">Fonts</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
            </TabsList>
            <TabsContent value="intro" className="py-4 grid gap-10">
              <p className="text-xl lg:text-3xl font-bold">Introduction</p>
              <WhatIsSkeleton />
              <div className="bg-accent/50 rounded-md px-4">
                <SkeletonStack />
              </div>
            </TabsContent>
            <TabsContent value="components" className="py-4 grid gap-10">
              <p className="text-xl lg:text-3xl font-bold">Components</p>
              <div className="rounded-md px-4">
                <SampleComponents />
              </div>
            </TabsContent>
            <TabsContent value="fonts" className="py-4 grid gap-10">
              <p className="text-xl lg:text-3xl font-bold">Fonts</p>
              <div className="rounded-md px-4">
                <FontStyles />
              </div>
            </TabsContent>
            <TabsContent value="theme" className="py-4 grid gap-10">
              <p className="text-xl lg:text-3xl font-bold">Colors</p>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
