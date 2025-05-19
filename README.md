# Design Flow

A modern project management tool specifically designed for design teams, helping them track project progress, team moods, and deliverables throughout the design process.

## Features

### 1. Project Management
- Create and manage design projects
- Track project progress through different design phases
- Organize deliverables and tasks

### 2. Team Mood Tracking
- Real-time mood updates from team members
- Visual mood tracking graph showing team sentiment over time
- Four mood levels: Great, Good, Okay, and Not Great
- Historical mood data visualization

### 3. Design Phase Management
- Pre-defined design phases with best practices
- Customizable deliverables for each phase
- Progress tracking for each phase

### 4. Collaborative Features
- Team updates and comments
- Project-specific discussions
- Real-time status updates

## Tech Stack

- **Frontend**: Next.js 14 with React 18
- **UI Framework**: Chakra UI
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Charts**: Chart.js with React-Chartjs-2
- **Drag and Drop**: @hello-pangea/dnd

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/design-flow.git
cd design-flow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
design-flow/
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   ├── context/          # React context providers
│   ├── data/            # Static data and configurations
│   ├── lib/             # Utility functions and API calls
│   └── ...              # Page components and routing
├── public/               # Static files
├── supabase/            # Supabase configurations and migrations
└── ...
```

## Key Components

### MoodGraph
- Visualizes team mood over time
- Uses Chart.js for smooth animations
- Supports both light and dark themes
- Responsive design for different screen sizes

### Project Updates
- Real-time project status updates
- Integrated mood tracking
- Comment system for team discussions

### Design Phases
- Structured approach to design projects
- Pre-defined deliverables and best practices
- Customizable workflow

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Chakra UI for the beautiful component library
- Chart.js for the visualization capabilities
- Supabase for the backend infrastructure
- The Next.js team for the amazing framework 