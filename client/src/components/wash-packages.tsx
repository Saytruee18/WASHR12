import { motion } from "framer-motion";
import { Check, Car, Star } from "lucide-react";

interface WashPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  popular?: boolean;
  features: string[];
}

interface WashPackagesProps {
  packages: WashPackage[];
  onPackageSelect: (pkg: WashPackage) => void;
}

export function WashPackages({ packages, onPackageSelect }: WashPackagesProps) {
  const getPackageIcon = (pkg: WashPackage) => {
    if (pkg.id === "privatgrundstück") return <Star className="text-primary h-6 w-6" />;
    return <Car className="text-primary h-6 w-6" />;
  };

  const getPackageColor = (pkg: WashPackage) => {
    if (pkg.popular) return "bg-primary/10";
    return "bg-muted/30";
  };

  return (
    <div className="space-y-4">
      {packages.map((pkg, index) => (
        <motion.div
          key={pkg.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onPackageSelect(pkg)}
          className={`bg-card rounded-3xl p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 relative border touch-target mobile-optimized ${
            pkg.popular 
              ? "border-primary shadow-primary/20 bg-gradient-to-br from-primary/5 to-primary/10" 
              : "border-border hover:border-primary/30"
          } hover:scale-[1.02] active:scale-[0.98] group`}
        >
          {pkg.popular && (
            <div className="absolute -top-3 left-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1 rounded-full text-sm font-medium shadow-lg">
              ⭐ Beliebt
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 ${getPackageColor(pkg)} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                {getPackageIcon(pkg)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg group-hover:text-primary transition-colors duration-200">{pkg.name}</h4>
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary group-hover:scale-105 transition-transform duration-200 inline-block">{pkg.price}€</span>
            </div>
          </div>
          
          <ul className="text-sm text-muted-foreground space-y-1">
            {pkg.features.map((feature, i) => (
              <li key={i} className="flex items-center">
                <Check className="text-primary h-4 w-4 mr-2" />
                {feature}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
