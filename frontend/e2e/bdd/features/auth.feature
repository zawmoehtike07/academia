Feature: User Authentication

  Scenario: Failed login displays error message
    Given I am on the login page
    When I attempt to log in with username "invaliduser" and password "wrongpass"
    Then I should see an error message "Invalid credentials"

  Scenario: Successful login redirects to home page
    Given I am on the login page
    When I attempt to log in with username "alex" and password "secret123"
    Then I should be redirected to the home page
    And I should see "Welcome, alex" in the sidebar
