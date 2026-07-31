-- Bootstrap the initial administrator account for Collabix.
--
-- After this migration runs, every other user must be created through
-- the application's User Management module.  No additional manual
-- INSERTs into the users table should ever be needed.
--
-- Admin details
--   First name : Tahir
--   Last name  : Elkadib
--   Email      : tahirelkadib36@gmail.com
--   Password   : Admin@123456 (BCrypt hashed, $2a$10$ cost factor)
--   Status     : ACTIVE
--   Role       : ADMIN (existing role, permissions inherited through role)

-- Insert the admin user only when the email does not already exist
INSERT INTO users (
    id,
    first_name,
    last_name,
    email,
    password,
    member_type,
    status,
    enabled,
    failed_login_attempts,
    created_at,
    updated_at,
    created_by,
    updated_by,
    version
)
SELECT
    gen_random_uuid(),
    'Tahir',
    'Elkadib',
    'tahirelkadib36@gmail.com',
    '$2a$10$0DXoz7ONsFrReq8kT9fT8.x1qBtbEqMRbi0dBoXcxdECScL/yJ2Xm',
    'EMPLOYEE',
    'ACTIVE',
    TRUE,
    0,
    NOW(),
    NOW(),
    NULL,
    NULL,
    0
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'tahirelkadib36@gmail.com'
);

-- Link the admin user to the existing ADMIN role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
    CROSS JOIN roles r
WHERE u.email = 'tahirelkadib36@gmail.com'
  AND r.name = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.user_id = u.id AND ur.role_id = r.id
  );
