import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ui/theme-provider";
import { useToast } from "@/hooks/use-toast";

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  businessName: z.string().optional(),
  role: z.string().optional(),
});

const appSettingsSchema = z.object({
  defaultVat: z.coerce.number().min(0, "VAT must be positive").max(100, "VAT cannot exceed 100%"),
  defaultCategory: z.string().optional(),
  defaultServings: z.coerce.number().min(1, "Default servings must be at least 1"),
  currencySymbol: z.string().min(1, "Currency symbol is required"),
  darkMode: z.boolean().default(false),
  notifications: z.boolean().default(true),
});

export default function Settings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // User Form
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "Chef Michael",
      email: "chef@example.com",
      businessName: "Gourmet Kitchen",
      role: "Executive Chef"
    },
  });
  
  // App Settings Form
  const appSettingsForm = useForm<z.infer<typeof appSettingsSchema>>({
    resolver: zodResolver(appSettingsSchema),
    defaultValues: {
      defaultVat: 20,
      defaultCategory: "main",
      defaultServings: 4,
      currencySymbol: "€",
      darkMode: theme === "dark",
      notifications: true
    },
  });
  
  // Toggle theme when dark mode setting changes
  const handleThemeChange = (checked: boolean) => {
    appSettingsForm.setValue("darkMode", checked);
    setTheme(checked ? "dark" : "light");
  };
  
  // Submit User Form
  const onSubmitUserForm = (values: z.infer<typeof userFormSchema>) => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });
    }, 1000);
    
    console.log("User form values:", values);
  };
  
  // Submit App Settings Form
  const onSubmitAppSettings = (values: z.infer<typeof appSettingsSchema>) => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings updated",
        description: "Your application settings have been updated successfully."
      });
    }, 1000);
    
    console.log("App settings form values:", values);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-slab font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-600 mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="app">App Settings</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your personal information and business details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...userForm}>
                <form 
                  id="profile-form" 
                  onSubmit={userForm.handleSubmit(onSubmitUserForm)} 
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={userForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={userForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={userForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your business name (optional)" {...field} />
                          </FormControl>
                          <FormDescription>
                            This will appear on printed recipe cards
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={userForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input placeholder="Your role (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                form="profile-form"
                type="submit"
                className="bg-primary text-white hover:bg-primary/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* App Settings */}
        <TabsContent value="app">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>
                Configure default values and behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...appSettingsForm}>
                <form 
                  id="app-settings-form" 
                  onSubmit={appSettingsForm.handleSubmit(onSubmitAppSettings)} 
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Default Recipe Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={appSettingsForm.control}
                        name="defaultVat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default VAT (%)</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} max={100} {...field} />
                            </FormControl>
                            <FormDescription>
                              Default VAT percentage for cost calculations
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={appSettingsForm.control}
                        name="defaultCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Category</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Default category for new recipes
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={appSettingsForm.control}
                        name="defaultServings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Servings</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <FormDescription>
                              Default number of servings for new recipes
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={appSettingsForm.control}
                        name="currencySymbol"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency Symbol</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Currency symbol for cost displays
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">App Preferences</h3>
                    <div className="space-y-4">
                      <FormField
                        control={appSettingsForm.control}
                        name="darkMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Dark Mode</FormLabel>
                              <FormDescription>
                                Enable dark theme for the application
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={handleThemeChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={appSettingsForm.control}
                        name="notifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Notifications</FormLabel>
                              <FormDescription>
                                Enable notifications for recipe updates
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                form="app-settings-form"
                type="submit"
                className="bg-primary text-white hover:bg-primary/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* About */}
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About GastroCalc Pro</CardTitle>
              <CardDescription>
                Information about the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-2">Version</h3>
                <p className="text-neutral-600">1.0.0</p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-2">Description</h3>
                <p className="text-neutral-600">
                  GastroCalc Pro is a comprehensive recipe management and food cost calculation application 
                  designed for culinary professionals. Easily create and manage recipes, calculate precise 
                  food costs, generate production sheets, and track ingredients.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-2">Features</h3>
                <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                  <li>Comprehensive recipe management</li>
                  <li>Precise food cost calculation</li>
                  <li>Ingredient database with cost tracking</li>
                  <li>Recipe categorization</li>
                  <li>PDF generation for recipe cards</li>
                  <li>Allergen identification</li>
                  <li>Profitability analysis and reporting</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-2">Credits</h3>
                <p className="text-neutral-600">
                  Developed by GastroCalc Pro Team.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} GastroCalc Pro. All rights reserved.
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
