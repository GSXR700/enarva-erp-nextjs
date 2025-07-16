import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface RevenueChartProps {
    data: {
        labels: string[];
        values: number[];
    };
}

export default function RevenueChart({ data }: RevenueChartProps) {
    const chartData: ChartData<'line'> = {
        labels: data.labels,
        datasets: [
            {
                label: 'Revenus mensuels',
                data: data.values,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Évolution des revenus',
                font: {
                    size: 16,
                    weight: 'normal',
                },
                padding: {
                    bottom: 20,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                    }).format(value as number),
                },
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    return (
        <div className="bg-white dark:bg-dark-container p-6 rounded-lg shadow-md">
            <Line data={chartData} options={options} />
        </div>
    );
}
