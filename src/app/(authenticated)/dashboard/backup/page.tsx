'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BackupPage() {
  const backupStats = {
    totalStorage: 2048, // GB
    usedStorage: 1435,
    lastBackup: "2024-03-20 23:00",
    successRate: 99.8,
    activeJobs: 3,
    totalFiles: 1250000,
    failedTasks: 2,
    dataChange: 4.2, // GB
    totalSnapshots: 156,
    recoveryPoints: 42,
    deduplicationRatio: 4.5,
    compressionRatio: 2.8
  };

  const backupJobs = [
    {
      name: "Database Backup",
      schedule: "Every 6 hours",
      lastRun: "2024-03-20 23:00",
      nextRun: "2024-03-21 05:00",
      size: 850,
      status: "completed",
      duration: "45 minutes",
      type: "Incremental",
      retention: "30 days",
      priority: "High",
      verificationStatus: "Verified"
    },
    {
      name: "File System Backup",
      schedule: "Daily",
      lastRun: "2024-03-20 22:00",
      nextRun: "2024-03-21 22:00",
      size: 525,
      status: "completed",
      duration: "2 hours",
      type: "Full",
      retention: "90 days",
      priority: "Medium",
      verificationStatus: "Pending"
    },
    {
      name: "User Data Backup",
      schedule: "Every 12 hours",
      lastRun: "2024-03-20 18:00",
      nextRun: "2024-03-21 06:00",
      size: 60,
      status: "completed",
      duration: "15 minutes",
      type: "Differential",
      retention: "60 days",
      priority: "Medium",
      verificationStatus: "Verified"
    }
  ];

  const retentionPolicies = [
    {
      type: "Critical Data",
      retention: "90 days",
      copies: 3,
      encrypted: true,
      size: 450,
      schedule: "Every 4 hours",
      compression: "High",
      deduplication: true,
      verificationFrequency: "Daily",
      archivalPolicy: "Cold Storage after 30 days"
    },
    {
      type: "Business Data",
      retention: "60 days",
      copies: 2,
      encrypted: true,
      size: 785,
      schedule: "Every 6 hours",
      compression: "Medium",
      deduplication: true,
      verificationFrequency: "Weekly",
      archivalPolicy: "Cold Storage after 60 days"
    },
    {
      type: "User Data",
      retention: "30 days",
      copies: 1,
      encrypted: true,
      size: 200,
      schedule: "Every 12 hours",
      compression: "Low",
      deduplication: true,
      verificationFrequency: "Monthly",
      archivalPolicy: "Delete after retention period"
    }
  ];

  const recentActivities = [
    {
      action: "Backup Completed",
      target: "Database Backup",
      timestamp: "2024-03-20 23:00",
      status: "success",
      details: "Full backup completed successfully",
      size: "850GB",
      duration: "45 minutes",
      verificationStatus: "Passed"
    },
    {
      action: "Storage Optimization",
      target: "System",
      timestamp: "2024-03-20 22:30",
      status: "success",
      details: "Cleaned up 25GB of redundant data",
      optimizationType: "Deduplication",
      spaceRecovered: "25GB"
    },
    {
      action: "Retention Check",
      target: "Business Data",
      timestamp: "2024-03-20 22:00",
      status: "warning",
      details: "Approaching storage limit (85% used)",
      affectedData: "785GB",
      recommendation: "Consider archival"
    },
    {
      action: "Backup Verification",
      target: "User Data Backup",
      timestamp: "2024-03-20 21:00",
      status: "success",
      details: "Integrity check passed",
      verificationMethod: "Checksum",
      coverage: "100%"
    }
  ];

  const storageLocations = [
    {
      name: "Primary Storage",
      type: "Local SSD Array",
      totalCapacity: 1000,
      usedCapacity: 850,
      health: "Healthy",
      temperature: "35°C",
      readSpeed: "2.1 GB/s",
      writeSpeed: "1.8 GB/s"
    },
    {
      name: "Secondary Storage",
      type: "Network Storage",
      totalCapacity: 2000,
      usedCapacity: 1200,
      health: "Healthy",
      temperature: "38°C",
      readSpeed: "1.8 GB/s",
      writeSpeed: "1.5 GB/s"
    },
    {
      name: "Archive Storage",
      type: "Cloud Storage",
      totalCapacity: 5000,
      usedCapacity: 2500,
      health: "Healthy",
      accessLatency: "150ms",
      costPerGB: "$0.01",
      lastSync: "5 minutes ago"
    }
  ];

  const performanceMetrics = [
    {
      metric: "Backup Speed",
      value: "1.2 GB/s",
      trend: "stable",
      lastMeasured: "5 minutes ago"
    },
    {
      metric: "Recovery Speed",
      value: "800 MB/s",
      trend: "improving",
      lastMeasured: "15 minutes ago"
    },
    {
      metric: "Deduplication Ratio",
      value: "4.5:1",
      trend: "improving",
      lastMeasured: "1 hour ago"
    },
    {
      metric: "Compression Ratio",
      value: "2.8:1",
      trend: "stable",
      lastMeasured: "1 hour ago"
    }
  ];

  return (
    <div className="min-h-screen bg-[#1c1d20]">
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#f5f5f7] mb-1">KRXBackup™ Monitor</h1>
          <p className="text-sm text-[#f5f5f7]/70">Enterprise Backup & Recovery Management</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{backupStats.usedStorage}GB</div>
              <Progress 
                value={(backupStats.usedStorage / backupStats.totalStorage) * 100} 
                className="h-1 mt-2 bg-[#f5f5f7]/5" 
              />
              <p className="text-xs text-[#f5f5f7]/50 mt-2">
                {((backupStats.usedStorage / backupStats.totalStorage) * 100).toFixed(1)}% of {backupStats.totalStorage}GB
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{backupStats.successRate}%</div>
              <Progress value={backupStats.successRate} className="h-1 mt-2 bg-[#f5f5f7]/5" />
              <p className="text-xs text-[#f5f5f7]/50 mt-2">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{backupStats.activeJobs}</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-[#f5f5f7]/50">Running backup tasks</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Data Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{backupStats.dataChange}GB</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-[#f5f5f7]/50">New data last 24h</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList className="bg-[#1c1d20] border-b border-[#f5f5f7]/10">
            <TabsTrigger value="jobs" className="text-[#f5f5f7]">Backup Jobs</TabsTrigger>
            <TabsTrigger value="storage" className="text-[#f5f5f7]">Storage</TabsTrigger>
            <TabsTrigger value="performance" className="text-[#f5f5f7]">Performance</TabsTrigger>
            <TabsTrigger value="activities" className="text-[#f5f5f7]">Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-[#f5f5f7]">Active Backup Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {backupJobs.map((job, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#f5f5f7]">{job.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
                            {job.size}GB
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Type: </span>
                            <span className="text-[#f5f5f7]/70">{job.type}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Priority: </span>
                            <span className="text-[#f5f5f7]/70">{job.priority}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Last Run: </span>
                            <span className="text-[#f5f5f7]/70">{job.lastRun}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Next Run: </span>
                            <span className="text-[#f5f5f7]/70">{job.nextRun}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Duration: </span>
                            <span className="text-[#f5f5f7]/70">{job.duration}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Verification: </span>
                            <span className="text-[#f5f5f7]/70">{job.verificationStatus}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-[#f5f5f7]">Retention Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {retentionPolicies.map((policy, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#f5f5f7]">{policy.type}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
                            {policy.size}GB
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Retention: </span>
                            <span className="text-[#f5f5f7]/70">{policy.retention}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Copies: </span>
                            <span className="text-[#f5f5f7]/70">{policy.copies}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Schedule: </span>
                            <span className="text-[#f5f5f7]/70">{policy.schedule}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Compression: </span>
                            <span className="text-[#f5f5f7]/70">{policy.compression}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Verification: </span>
                            <span className="text-[#f5f5f7]/70">{policy.verificationFrequency}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Archival: </span>
                            <span className="text-[#f5f5f7]/70">
                              {policy.archivalPolicy.split(" ")[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {storageLocations.map((location, i) => (
                <Card key={i} className="bg-[#1c1d20] border-[#f5f5f7]/10">
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-[#f5f5f7]">{location.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[#f5f5f7]/70">{location.type}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
                            {location.health}
                          </span>
                        </div>
                        <Progress 
                          value={(location.usedCapacity / location.totalCapacity) * 100} 
                          className="h-1 bg-[#f5f5f7]/5" 
                        />
                        <p className="text-xs text-[#f5f5f7]/50 mt-2">
                          {location.usedCapacity}GB of {location.totalCapacity}GB used
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {location.temperature && (
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Temperature: </span>
                            <span className="text-[#f5f5f7]/70">{location.temperature}</span>
                          </div>
                        )}
                        {location.readSpeed && (
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Read: </span>
                            <span className="text-[#f5f5f7]/70">{location.readSpeed}</span>
                          </div>
                        )}
                        {location.writeSpeed && (
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Write: </span>
                            <span className="text-[#f5f5f7]/70">{location.writeSpeed}</span>
                          </div>
                        )}
                        {location.accessLatency && (
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Latency: </span>
                            <span className="text-[#f5f5f7]/70">{location.accessLatency}</span>
                          </div>
                        )}
                        {location.costPerGB && (
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Cost/GB: </span>
                            <span className="text-[#f5f5f7]/70">{location.costPerGB}</span>
                          </div>
                        )}
                        {location.lastSync && (
                          <div className="text-xs">
                            <span className="text-[#f5f5f7]/50">Last Sync: </span>
                            <span className="text-[#f5f5f7]/70">{location.lastSync}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-[#f5f5f7]">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.map((metric, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#f5f5f7]">{metric.metric}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
                            {metric.trend}
                          </span>
                        </div>
                        <div className="text-lg font-medium text-[#f5f5f7]">{metric.value}</div>
                        <p className="text-xs text-[#f5f5f7]/50 mt-2">Last measured: {metric.lastMeasured}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-[#f5f5f7]">Optimization Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#f5f5f7]">Deduplication Ratio</span>
                      </div>
                      <div className="text-lg font-medium text-[#f5f5f7]">{backupStats.deduplicationRatio}:1</div>
                      <p className="text-xs text-[#f5f5f7]/50 mt-2">Space saved through deduplication</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#f5f5f7]">Compression Ratio</span>
                      </div>
                      <div className="text-lg font-medium text-[#f5f5f7]">{backupStats.compressionRatio}:1</div>
                      <p className="text-xs text-[#f5f5f7]/50 mt-2">Space saved through compression</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#f5f5f7]">Recovery Points</span>
                      </div>
                      <div className="text-lg font-medium text-[#f5f5f7]">{backupStats.recoveryPoints}</div>
                      <p className="text-xs text-[#f5f5f7]/50 mt-2">Available restore points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
              <CardHeader>
                <CardTitle className="text-base font-medium text-[#f5f5f7]">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-[#f5f5f7]">{activity.action}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
                              {activity.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#f5f5f7]/50 mt-1">Target: {activity.target}</p>
                          <p className="text-xs text-[#f5f5f7]/40 mt-1">{activity.details}</p>
                          {activity.size && (
                            <p className="text-xs text-[#f5f5f7]/40 mt-1">Size: {activity.size}</p>
                          )}
                          {activity.duration && (
                            <p className="text-xs text-[#f5f5f7]/40 mt-1">Duration: {activity.duration}</p>
                          )}
                          {activity.verificationStatus && (
                            <p className="text-xs text-[#f5f5f7]/40 mt-1">
                              Verification: {activity.verificationStatus}
                            </p>
                          )}
                          {activity.optimizationType && (
                            <p className="text-xs text-[#f5f5f7]/40 mt-1">
                              Optimization: {activity.optimizationType}
                            </p>
                          )}
                          {activity.spaceRecovered && (
                            <p className="text-xs text-[#f5f5f7]/40 mt-1">
                              Space Recovered: {activity.spaceRecovered}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-[#f5f5f7]/40">{activity.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 