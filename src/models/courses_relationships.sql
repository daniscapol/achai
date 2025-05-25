-- Migration: Create course relationships and constraints
-- Date: 2024-01-25
-- Description: Creates relationships between courses and other tables

-- Create junction table for course tags (using existing tags table)
CREATE TABLE IF NOT EXISTS course_tags (
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, tag_id)
);

-- Create related products table to link courses with products
CREATE TABLE IF NOT EXISTS course_products (
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, product_id)
);

-- Create course enrollment tracking
CREATE TABLE IF NOT EXISTS course_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- This would reference your users table when implemented
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status VARCHAR(20) CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')) DEFAULT 'enrolled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Create course sections/modules table
CREATE TABLE IF NOT EXISTS course_sections (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, order_index)
);

-- Create user progress tracking for course sections
CREATE TABLE IF NOT EXISTS course_section_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- This would reference your users table when implemented
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES course_sections(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, section_id)
);

-- Create ratings table for courses
CREATE TABLE IF NOT EXISTS course_ratings (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL, -- This would reference your users table when implemented
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, user_id)
);

-- Create indexes for junction tables
CREATE INDEX idx_course_tags_course ON course_tags(course_id);
CREATE INDEX idx_course_tags_tag ON course_tags(tag_id);
CREATE INDEX idx_course_products_course ON course_products(course_id);
CREATE INDEX idx_course_products_product ON course_products(product_id);
CREATE INDEX idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX idx_course_sections_course ON course_sections(course_id);
CREATE INDEX idx_course_sections_order ON course_sections(course_id, order_index);
CREATE INDEX idx_course_section_progress_user ON course_section_progress(user_id);
CREATE INDEX idx_course_section_progress_course ON course_section_progress(course_id);
CREATE INDEX idx_course_ratings_course ON course_ratings(course_id);
CREATE INDEX idx_course_ratings_user ON course_ratings(user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_course_enrollments_updated_at 
    BEFORE UPDATE ON course_enrollments 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_course_sections_updated_at 
    BEFORE UPDATE ON course_sections 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_course_section_progress_updated_at 
    BEFORE UPDATE ON course_section_progress 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_course_ratings_updated_at 
    BEFORE UPDATE ON course_ratings 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Function to update course rating average
CREATE OR REPLACE FUNCTION update_course_rating_average()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses
    SET rating = (
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM course_ratings
        WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    ),
    rating_count = (
        SELECT COUNT(*)
        FROM course_ratings
        WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    )
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update course ratings
CREATE TRIGGER update_course_rating_on_insert
    AFTER INSERT ON course_ratings
    FOR EACH ROW
    EXECUTE PROCEDURE update_course_rating_average();

CREATE TRIGGER update_course_rating_on_update
    AFTER UPDATE ON course_ratings
    FOR EACH ROW
    EXECUTE PROCEDURE update_course_rating_average();

CREATE TRIGGER update_course_rating_on_delete
    AFTER DELETE ON course_ratings
    FOR EACH ROW
    EXECUTE PROCEDURE update_course_rating_average();

-- Function to update course enrollment count
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses
    SET enrollment_count = (
        SELECT COUNT(*)
        FROM course_enrollments
        WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
        AND status IN ('enrolled', 'in_progress', 'completed')
    )
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update enrollment count
CREATE TRIGGER update_enrollment_count_on_insert
    AFTER INSERT ON course_enrollments
    FOR EACH ROW
    EXECUTE PROCEDURE update_course_enrollment_count();

CREATE TRIGGER update_enrollment_count_on_update
    AFTER UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE PROCEDURE update_course_enrollment_count();

CREATE TRIGGER update_enrollment_count_on_delete
    AFTER DELETE ON course_enrollments
    FOR EACH ROW
    EXECUTE PROCEDURE update_course_enrollment_count();