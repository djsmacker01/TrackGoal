# Goal Tracker MVP - System Requirements

## What We're Building
A simple mobile goal tracking application that allows users to create, organize, and monitor personal goals across different life categories. Users can set goals with deadlines, track progress through milestones, and view basic analytics to stay motivated and on track.

## Core Features
- **Goal Creation**: Create goals with title, description, category, and deadline
- **Goal Categories**: Organize goals into predefined categories (Health, Career, Personal, Financial, Habits)
- **Goal Types**: Support three types - binary (done/not done), numerical targets, and percentage-based
- **Milestones**: Break down goals into smaller, trackable milestones
- **Progress Tracking**: Update progress and mark milestones as complete
- **Basic Analytics**: View completion rates, progress charts, and goal overview
- **Goal Management**: Edit, delete, and organize existing goals

## Required Pages

### Core Pages
- **Dashboard/Home**: Overview of all active goals and recent progress
- **Add Goal**: Form to create new goals with category and type selection
- **Edit Goal**: Form to modify existing goal details
- **Goal Detail**: Individual goal view with milestones and progress history
- **Add Milestones**: Interface to create and set milestones for a specific goal
- **Progress Update**: Interface to update goal progress and complete milestones
- **Goals List**: View all goals filtered by category or status

### Supporting Pages
- **Analytics**: Simple charts and completion statistics
- **Categories**: View goals organized by category
- **Settings**: Basic app preferences and goal management options

### Authentication Pages (Future Implementation with Supabase)
- **Login**: User login form
- **Sign Up**: User registration form
- **Forgot Password**: Password reset request form
- **Reset Password**: New password creation form
- **Profile**: User profile management and account settings
- **Onboarding**: First-time user welcome and setup flow