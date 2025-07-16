import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

interface MissionStatusChartProps {
    data: {
        labels: string[];
        values: number[];
    };
}

const statusColors = [
    'rgb(34, 197, 94)', // vert pour terminé
    'rgb(59, 130, 246)', // bleu pour en cours
    'rgb(234, 179, 8)', // jaune pour planifié
    'rgb(239, 68, 68)', // rouge pour retard
];

export default function MissionStatusChart({ data }: MissionStatusChartProps) {
    const chartData: ChartData<'doughnut'> = {
        labels: data.labels,
        datasets: [
            {
                data: data.values,
                backgroundColor: statusColors,
                borderColor: statusColors,
                borderWidth: 1,
            },
        ],
    };

    const options: ChartOptions<'doughnut'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                },
            },
            title: {
                display: true,
                text: 'Statut des missions',
                font: {
                    size: 16,
                    weight: 'normal',
                },
                padding: {
                    bottom: 20,
                },
            },
        },
        cutout: '60%',
    };

    return (
        <div className="bg-white dark:bg-dark-container p-6 rounded-lg shadow-md">
            <Doughnut data={chartData} options={options} />
        </div>
    );
}
