import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { useRecipes } from "@/lib/hooks/useRecipes";
import { useIngredients } from "@/lib/hooks/useIngredients";
import { formatCurrency } from "@/lib/utils";

export default function Reports() {
  const [timeFrame, setTimeFrame] = useState<"month" | "year">("month");
  const { data: recipes = [], isLoading: isLoadingRecipes } = useRecipes();
  const { data: ingredients = [], isLoading: isLoadingIngredients } = useIngredients();
  
  // Filter recipes that have cost data
  const recipesWithCosts = recipes.filter(r => 
    r.costPerServing !== null && 
    r.costPerServing !== undefined && 
    parseFloat(r.costPerServing as string) > 0
  );
  
  // Calculate overall stats
  const totalRecipes = recipes.length;
  const avgProfitMargin = recipesWithCosts.length > 0
    ? recipesWithCosts.reduce((sum, r) => sum + (parseFloat(r.profitMargin as string) || 0), 0) / recipesWithCosts.length
    : 0;
  const highestProfitRecipe = recipesWithCosts.length > 0
    ? recipesWithCosts.reduce((prev, current) => {
        return (parseFloat(prev.profitMargin as string) || 0) > (parseFloat(current.profitMargin as string) || 0) 
          ? prev 
          : current;
      }, recipesWithCosts[0])
    : null;
  
  // Calculate most expensive ingredients (top 5)
  const topIngredients = [...ingredients]
    .sort((a, b) => parseFloat(b.unitCost as string) - parseFloat(a.unitCost as string))
    .slice(0, 5);
  
  // Calculate recipe category distribution
  const categoryData = recipes.reduce((acc, recipe) => {
    const category = recipe.category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));
  
  // Prepare cost distribution data
  const costDistributionData = recipesWithCosts
    .sort((a, b) => parseFloat(a.costPerServing as string) - parseFloat(b.costPerServing as string))
    .map(recipe => ({
      name: recipe.name,
      cost: parseFloat(recipe.costPerServing as string),
      margin: parseFloat(recipe.profitMargin as string) || 0
    }));
  
  // Cost comparison data
  const costComparisonData = recipesWithCosts
    .slice(0, 10)
    .map(recipe => ({
      name: recipe.name,
      cost: parseFloat(recipe.costPerServing as string),
      selling: recipe.sellingPrice ? parseFloat(recipe.sellingPrice as string) : 0,
      profit: recipe.sellingPrice 
        ? parseFloat(recipe.sellingPrice as string) - parseFloat(recipe.costPerServing as string)
        : 0
    }));
  
  // Colors for charts
  const COLORS = [
    '#2E7D32', '#FF8F00', '#1976D2', '#D32F2F', '#7B1FA2', 
    '#388E3C', '#FFA000', '#1E88E5', '#E53935', '#8E24AA'
  ];
    
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-slab font-bold text-neutral-900">Reports & Analytics</h1>
          <p className="text-neutral-600 mt-1">
            Insights into your recipe costs and profitability
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Tabs 
            value={timeFrame} 
            onValueChange={(v: any) => setTimeFrame(v)}
            className="w-[200px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoadingRecipes || isLoadingIngredients ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Recipes</CardTitle>
                <CardDescription>All recipes in your library</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalRecipes}</div>
                <p className="text-sm text-neutral-500 mt-1">
                  {recipesWithCosts.length} with cost data
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Profit Margin</CardTitle>
                <CardDescription>Across all recipes with pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {avgProfitMargin.toFixed(1)}%
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  Based on {recipesWithCosts.length} recipes
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Top Profitable Recipe</CardTitle>
                <CardDescription>Highest profit margin</CardDescription>
              </CardHeader>
              <CardContent>
                {highestProfitRecipe ? (
                  <>
                    <div className="text-xl font-bold truncate">
                      {highestProfitRecipe.name}
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-neutral-500">Margin:</span>
                      <span className="font-bold text-primary">
                        {parseFloat(highestProfitRecipe.profitMargin as string).toFixed(1)}%
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-neutral-500">No profit data available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analysis */}
          <div className="space-y-6">
            {/* Recipe Category Distribution */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Recipe Distribution by Category</CardTitle>
                <CardDescription>
                  Breakdown of your recipe collection by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`${value} recipes`, 'Count']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Cost Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Distribution */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Cost per Serving Distribution</CardTitle>
                  <CardDescription>
                    Compare costs across different recipes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {costDistributionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={costDistributionData.slice(0, 10)}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={(value) => `€${value}`} />
                          <YAxis type="category" dataKey="name" width={100} tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value} />
                          <Tooltip formatter={(value: any) => [formatCurrency(value), 'Cost per Serving']} />
                          <Legend />
                          <Bar dataKey="cost" fill="#2E7D32" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-neutral-500">
                        No cost data available. Add costs to your recipes.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Profit Margin Analysis */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Profit Margin Analysis</CardTitle>
                  <CardDescription>
                    Profit margins for recipes with selling prices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {costComparisonData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={costComparisonData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                          <YAxis tickFormatter={(value) => `€${value}`} />
                          <Tooltip formatter={(value: any, name) => {
                            const label = name === 'cost' ? 'Cost' : name === 'selling' ? 'Selling Price' : 'Profit';
                            return [formatCurrency(value), label];
                          }} />
                          <Legend />
                          <Bar dataKey="cost" stackId="a" fill="#FF8F00" name="Cost" />
                          <Bar dataKey="profit" stackId="a" fill="#2E7D32" name="Profit" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-neutral-500">
                        No profit data available. Add selling prices to your recipes.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Ingredient Cost Analysis */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Top Expensive Ingredients</CardTitle>
                  <CardDescription>
                    Ingredients with highest unit costs
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/ingredients">Manage Ingredients</a>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {topIngredients.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topIngredients.map(ing => ({
                          name: ing.name,
                          unitCost: parseFloat(ing.unitCost as string),
                          unit: ing.unit
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `€${value}`} />
                        <Tooltip 
                          formatter={(value: any, name, item: any) => {
                            return [`€${value} per ${item.payload.unit}`, 'Unit Cost'];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="unitCost" fill="#1976D2" name="Unit Cost" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-500">
                      No ingredient data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {/* No Data Info */}
      {!isLoadingRecipes && !isLoadingIngredients && recipesWithCosts.length === 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>No Cost Data Available</CardTitle>
            <CardDescription>
              Add costs to your recipes to view detailed analytics and reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">To get started with recipe costing:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Add ingredients with accurate unit costs</li>
              <li>Create recipes and add your ingredients</li>
              <li>Set selling prices to calculate profit margins</li>
            </ol>
            <div className="mt-6 flex gap-4">
              <Button asChild>
                <a href="/ingredients">Add Ingredients</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/recipes/new">Create Recipe</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
