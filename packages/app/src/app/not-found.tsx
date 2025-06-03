import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import Link from "next/link";
import { Home, ChevronLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border border-accent/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-muted-foreground">404</span>
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Chain Derby
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="javascript:history.back()">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Go Back
              </Link>
            </Button>
          </div>
          
          <div className="pt-4 border-t border-accent/30">
            <p className="text-sm text-muted-foreground">
              Having trouble? Check that the URL is correct or try starting a new race.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
