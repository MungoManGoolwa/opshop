import { useState, useEffect } from "react";
import { errorLogger } from "@/utils/errorLogger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Bug, Download, Trash2, RefreshCw, TrendingUp, Users, Globe } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SEOHead from "@/components/SEOHead";
import type { ErrorLogEntry } from "@/utils/errorLogger";

export default function ErrorDashboardPage() {
  const [errors, setErrors] = useState<ErrorLogEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadErrors();
    loadStats();
  }, []);

  const loadErrors = () => {
    const storedErrors = errorLogger.getStoredErrors();
    setErrors(storedErrors);
  };

  const loadStats = () => {
    const errorStats = errorLogger.getErrorStats();
    setStats(errorStats);
  };

  const clearAllErrors = () => {
    errorLogger.clearStoredErrors();
    loadErrors();
    loadStats();
  };

  const downloadErrorReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      stats,
      errors: errors.map(error => ({
        ...error,
        timestamp: error.timestamp.toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerTestError = () => {
    // Test different types of errors
    errorLogger.logError({
      message: "Test error from dashboard",
      severity: "low",
      category: "user",
      metadata: { test: true, timestamp: Date.now() }
    });
    
    setTimeout(() => {
      loadErrors();
      loadStats();
    }, 100);
  };

  const filteredErrors = errors.filter(error => {
    const severityMatch = selectedSeverity === "all" || error.severity === selectedSeverity;
    const categoryMatch = selectedCategory === "all" || error.category === selectedCategory;
    return severityMatch && categoryMatch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'react': return <Bug className="h-4 w-4" />;
      case 'network': return <Globe className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEOHead
        title="Error Dashboard - Development Tools"
        description="Monitor and manage client-side errors, React component failures, and application exceptions for better debugging and maintenance."
        keywords="error monitoring, debugging, React errors, client-side logging"
        url="/error-dashboard"
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Error Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Monitor client-side errors and application exceptions
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={triggerTestError}>
                <Bug className="h-4 w-4 mr-2" />
                Test Error
              </Button>
              <Button variant="outline" onClick={downloadErrorReport}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button variant="destructive" onClick={clearAllErrors}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Recent (1h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.recent}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Most Common</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {Object.entries(stats.byCategory).length > 0 ? (
                      Object.entries(stats.byCategory)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 1)
                        .map(([category, count]) => (
                          <div key={category}>
                            <span className="capitalize">{category}</span>
                            <span className="text-gray-500 ml-2">({count})</span>
                          </div>
                        ))
                    ) : (
                      <span className="text-gray-500">No errors</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.bySeverity.critical || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Management */}
          <Tabs defaultValue="errors" className="space-y-6">
            <TabsList>
              <TabsTrigger value="errors">Error Log</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="errors" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-center">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Severity</label>
                      <select
                        value={selectedSeverity}
                        onChange={(e) => setSelectedSeverity(e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="all">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="react">React</option>
                        <option value="javascript">JavaScript</option>
                        <option value="network">Network</option>
                        <option value="user">User</option>
                        <option value="security">Security</option>
                      </select>
                    </div>
                    
                    <Button variant="outline" onClick={loadErrors} className="mt-6">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Error List */}
              <div className="space-y-4">
                {filteredErrors.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Bug className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No errors found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {errors.length === 0 
                          ? "No errors have been logged yet."
                          : "No errors match the current filters."
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredErrors.map((error) => (
                    <Card key={error.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getCategoryIcon(error.category)}
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base leading-6 break-words">
                                {error.message}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {error.timestamp.toLocaleString()} • Session: {error.sessionId.slice(-8)}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className={getSeverityColor(error.severity)}>
                              {error.severity}
                            </Badge>
                            <Badge variant="outline">
                              {error.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {(error.stack || error.componentStack || error.metadata) && (
                        <CardContent>
                          <details className="group">
                            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                              Show Details
                            </summary>
                            <div className="mt-3 space-y-3 text-xs">
                              {error.url && (
                                <div>
                                  <strong>URL:</strong> {error.url}
                                </div>
                              )}
                              
                              {error.metadata && Object.keys(error.metadata).length > 0 && (
                                <div>
                                  <strong>Metadata:</strong>
                                  <pre className="mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(error.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                              
                              {error.componentStack && (
                                <div>
                                  <strong>Component Stack:</strong>
                                  <pre className="mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                                    {error.componentStack}
                                  </pre>
                                </div>
                              )}
                              
                              {error.stack && (
                                <div>
                                  <strong>Stack Trace:</strong>
                                  <pre className="mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                                    {error.stack}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </details>
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {stats && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Errors by Severity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(stats.bySeverity).map(([severity, count]) => (
                          <div key={severity} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(severity)}>
                                {severity}
                              </Badge>
                            </div>
                            <span className="font-medium">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Errors by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(stats.byCategory).map(([category, count]) => (
                          <div key={category} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(category)}
                              <span className="capitalize">{category}</span>
                            </div>
                            <span className="font-medium">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Error Logging Configuration</CardTitle>
                  <CardDescription>
                    Configure how errors are logged and handled
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Console Logging</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Log errors to browser console
                        </p>
                      </div>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Server Logging</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Send errors to server endpoint
                        </p>
                      </div>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Local Storage</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Store errors in browser storage
                        </p>
                      </div>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Development Tools</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Access error logger in browser console: <code>window.errorLogger</code>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}