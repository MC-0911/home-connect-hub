import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Home, Plus } from "lucide-react";
const SuccessStep = () => {
  return <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center py-[85px]">
        {/* Success Animation */}
        <div className="mb-8 animate-fade-in">
          <div className="w-24 h-24 mx-auto bg-secondary rounded-full flex items-center justify-center mb-6 animate-float">
            <Check className="h-12 w-12 text-secondary-foreground" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-primary font-serif mb-4">
            Thank You for Listing with Us!
          </h1>
          
          <p className="text-lg text-muted-foreground mb-2">
            Your listing is now under review! 🎉
          </p>
          
          <p className="text-muted-foreground">
            Our team will review your property listing and once approved, 
            it will be visible to potential buyers. 🏡💛
          </p>
        </div>

        {/* What's Next Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 mb-8 animate-slide-up">
          <h2 className="text-lg font-semibold text-primary mb-4">What's Next?</h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-secondary">1</span>
              </div>
              <div>
                <p className="font-medium text-primary">Review Process</p>
                <p className="text-sm text-muted-foreground">
                  Our team will review your listing to ensure quality standards
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-secondary">2</span>
              </div>
              <div>
                <p className="font-medium text-primary">Go Live</p>
                <p className="text-sm text-muted-foreground">
                  Once approved, your property will be visible to all buyers
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-secondary">3</span>
              </div>
              <div>
                <p className="font-medium text-primary">Get Notified</p>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts when buyers show interest in your property
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up" style={{
        animationDelay: "0.2s"
      }}>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <Button asChild className="gap-2 bg-secondary hover:bg-secondary/90">
            <Link to="/add-property">
              <Plus className="h-4 w-4" />
              List Another Property
            </Link>
          </Button>
        </div>
      </div>
    </div>;
};
export default SuccessStep;