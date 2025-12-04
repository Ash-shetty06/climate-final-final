import React, { useState } from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';

const WeatherAlerts = ({ alerts }) => {
    const [dismissedAlerts, setDismissedAlerts] = useState([]);

    const dismissAlert = (alertId) => {
        setDismissedAlerts([...dismissedAlerts, alertId]);
    };

    const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

    if (visibleAlerts.length === 0) return null;

    return (
        <div className="space-y-3 mb-6">
            {visibleAlerts.map(alert => (
                <div
                    key={alert.id}
                    className={`${alert.color} border rounded-lg p-4 flex items-start gap-3 animate-fadeIn`}
                >
                    {alert.type === 'danger' ? (
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">{alert.title}</h4>
                        <p className="text-sm">{alert.message}</p>
                    </div>
                    <button
                        onClick={() => dismissAlert(alert.id)}
                        className="flex-shrink-0 hover:opacity-70 transition-opacity"
                        aria-label="Dismiss alert"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default WeatherAlerts;
