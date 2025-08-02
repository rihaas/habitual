'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

interface GamificationTrackerProps {
  level: number;
  points: number;
  pointsToNextLevel: number;
}

export function GamificationTracker({ level, points, pointsToNextLevel }: GamificationTrackerProps) {
  const progressPercentage = pointsToNextLevel > 0 ? (points / pointsToNextLevel) * 100 : 0;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
                <CardTitle className="font-headline">Level {level}</CardTitle>
                <CardDescription>Keep up the great work!</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div className="flex justify-between items-center text-muted-foreground">
              <p className="text-sm font-medium">Level Progress</p>
              <p className="text-sm font-bold">{points} / {pointsToNextLevel} XP</p>
            </div>
            <Progress value={progressPercentage} aria-label={`${Math.round(progressPercentage)}% to next level`} />
          </div>
      </CardContent>
    </Card>
  );
}
