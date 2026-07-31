CREATE TABLE hr_performance_reviews (
    id UUID PRIMARY KEY,

    -- Relationships
    employee_id UUID NOT NULL REFERENCES hr_employees(id),
    reviewer_id UUID NOT NULL REFERENCES hr_employees(id),
    team_id UUID REFERENCES teams(id),

    -- Review period and dates
    review_period VARCHAR(20) NOT NULL,
    review_date DATE NOT NULL,
    due_date DATE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

    -- Scoring criteria (0-20 each)
    objectives_achieved INT CHECK (objectives_achieved >= 0 AND objectives_achieved <= 20),
    technical_skills INT CHECK (technical_skills >= 0 AND technical_skills <= 20),
    soft_skills INT CHECK (soft_skills >= 0 AND soft_skills <= 20),
    punctuality_attendance INT CHECK (punctuality_attendance >= 0 AND punctuality_attendance <= 20),
    teamwork INT CHECK (teamwork >= 0 AND teamwork <= 20),
    initiative_problem_solving INT CHECK (initiative_problem_solving >= 0 AND initiative_problem_solving <= 20),
    communication INT CHECK (communication >= 0 AND communication <= 20),
    continuous_learning_adaptability INT CHECK (continuous_learning_adaptability >= 0 AND continuous_learning_adaptability <= 20),

    -- Auto-calculated fields
    total_score INT,
    max_score INT DEFAULT 160,
    percentage DOUBLE PRECISION,
    average_score DOUBLE PRECISION,
    performance_level VARCHAR(25),

    -- Comments
    general_comment VARCHAR(2000),
    manager_comment VARCHAR(2000),
    employee_comment VARCHAR(2000),

    -- Qualitative feedback
    strengths TEXT,
    areas_for_improvement TEXT,
    development_plan TEXT,

    -- Recommendations
    promotion_recommended BOOLEAN,
    salary_increase_recommended BOOLEAN,

    -- Lifecycle timestamps
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason VARCHAR(1000),

    -- AuditableEntity fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    version BIGINT NOT NULL DEFAULT 0
);

-- Indexes for common queries
CREATE INDEX idx_hr_pr_employee_id ON hr_performance_reviews(employee_id);
CREATE INDEX idx_hr_pr_reviewer_id ON hr_performance_reviews(reviewer_id);
CREATE INDEX idx_hr_pr_team_id ON hr_performance_reviews(team_id);
CREATE INDEX idx_hr_pr_status ON hr_performance_reviews(status);
CREATE INDEX idx_hr_pr_period ON hr_performance_reviews(review_period);
CREATE INDEX idx_hr_pr_performance_level ON hr_performance_reviews(performance_level);
CREATE INDEX idx_hr_pr_review_date ON hr_performance_reviews(review_date);
CREATE INDEX idx_hr_pr_employee_status ON hr_performance_reviews(employee_id, status);
CREATE INDEX idx_hr_pr_employee_date ON hr_performance_reviews(employee_id, review_date DESC);
