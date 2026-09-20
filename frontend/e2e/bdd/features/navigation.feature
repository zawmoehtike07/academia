Feature: Navigation and Access Control

  Scenario Outline: Unauthenticated user is redirected from protected route
    Given I am an unauthenticated user
    When I navigate to "<path>"
    Then I should be redirected to the login page

    Examples:
      | path       |
      | /home      |
      | /dashboard |
      | /groups    |
      | /study     |

  Scenario: Authenticated user toggles theme
    Given I am logged in as "alex"
    When I click the theme toggle button
    Then the theme should toggle between light and dark mode
