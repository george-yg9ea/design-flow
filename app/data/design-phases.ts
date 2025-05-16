export interface Deliverable {
  id: string;
  name: string;
  description: string;
  preparation: {
    steps: string[];
    resources?: { title: string; url: string; }[];
  };
}

export interface DesignPhase {
  title: string;
  description: string;
  deliverables: Deliverable[];
}

export const designPhases: DesignPhase[] = [
  {
    title: 'Empathize',
    description: 'Understanding your users, their needs, wants, motivations, and pain points through research and observation.',
    deliverables: [
      {
        id: 'user-interviews',
        name: 'User Interviews',
        description: 'One-on-one conversations with users to understand their experiences and needs',
        preparation: {
          steps: [
            'Define your research objectives and questions',
            'Create a discussion guide with open-ended questions',
            'Identify and recruit relevant participants',
            'Prepare your recording equipment and consent forms',
            'Find a quiet, comfortable location for the interview'
          ],
          resources: [
            {
              title: 'How to Conduct User Interviews',
              url: 'https://www.nngroup.com/articles/user-interviews/'
            },
            {
              title: 'User Interview Template',
              url: 'https://www.usability.gov/how-to-and-tools/methods/individual-interviews.html'
            }
          ]
        }
      },
      {
        id: 'user-surveys',
        name: 'User Surveys',
        description: 'Questionnaires to collect quantitative and qualitative data from users',
        preparation: {
          steps: [
            'Define the survey goals and target audience',
            'Write clear, unbiased questions',
            'Mix question types (multiple choice, rating scales, open-ended)',
            'Keep the survey concise and focused',
            'Test the survey with a small group first'
          ],
          resources: [
            {
              title: 'Survey Design Best Practices',
              url: 'https://www.surveymonkey.com/mp/survey-guidelines/'
            }
          ]
        }
      },
      {
        id: 'empathy-maps',
        name: 'Empathy Maps',
        description: 'Visual tool to capture user attitudes and behaviors',
        preparation: {
          steps: [
            'Gather user research data from interviews and observations',
            'Create quadrants: Says, Thinks, Does, Feels',
            'Include relevant user quotes and observations',
            'Add pain points and goals',
            'Review with your team for completeness'
          ],
          resources: [
            {
              title: 'Creating Empathy Maps',
              url: 'https://www.nngroup.com/articles/empathy-mapping/'
            }
          ]
        }
      },
      {
        id: 'user-journey-maps',
        name: 'User Journey Maps',
        description: 'Visual representation of a user\'s experience with your product or service',
        preparation: {
          steps: [
            'Identify the user persona and scenario',
            'List all touchpoints and interactions',
            'Map out the chronological sequence',
            'Add user thoughts, feelings, and pain points',
            'Include opportunities for improvement'
          ],
          resources: [
            {
              title: 'How to Create User Journey Maps',
              url: 'https://www.nngroup.com/articles/customer-journey-mapping/'
            }
          ]
        }
      }
    ]
  },
  {
    title: 'Define',
    description: 'Analyzing research findings to define core problems and user needs through clear problem statements.',
    deliverables: [
      {
        id: 'user-personas',
        name: 'User Personas',
        description: 'Fictional characters representing your key user groups',
        preparation: {
          steps: [
            'Analyze user research data to identify patterns',
            'Group users with similar behaviors and goals',
            'Create demographic and behavioral profiles',
            'Add motivations, goals, and pain points',
            'Include relevant quotes and scenarios'
          ],
          resources: [
            {
              title: 'Creating User Personas',
              url: 'https://www.nngroup.com/articles/persona-creation/'
            }
          ]
        }
      },
      {
        id: 'problem-statements',
        name: 'Problem Statements',
        description: 'Clear articulation of the user problems you\'re trying to solve',
        preparation: {
          steps: [
            'Review research findings and insights',
            'Identify key user pain points',
            'Frame problems from the user\'s perspective',
            'Make statements specific and actionable',
            'Validate statements with stakeholders'
          ],
          resources: [
            {
              title: 'Writing Problem Statements',
              url: 'https://www.interaction-design.org/literature/article/define-and-frame-your-design-challenge-by-creating-your-point-of-view-and-ask-how-might-we'
            }
          ]
        }
      },
      {
        id: 'user-stories',
        name: 'User Stories',
        description: 'Short descriptions of features from the user\'s perspective',
        preparation: {
          steps: [
            'Identify user roles and goals',
            'Use the format: As a [user], I want to [action] so that [benefit]',
            'Keep stories simple and focused',
            'Add acceptance criteria',
            'Prioritize stories based on value'
          ],
          resources: [
            {
              title: 'Writing User Stories',
              url: 'https://www.atlassian.com/agile/project-management/user-stories'
            }
          ]
        }
      },
      {
        id: 'how-might-we',
        name: 'How Might We Questions',
        description: 'Questions that frame your problem as opportunities for design',
        preparation: {
          steps: [
            'Review problem statements',
            'Reframe problems as opportunities',
            'Start questions with "How might we..."',
            'Make questions broad enough for multiple solutions',
            'Ensure questions are focused on users'
          ],
          resources: [
            {
              title: 'How Might We Method',
              url: 'https://www.designkit.org/methods/3'
            }
          ]
        }
      }
    ]
  },
  {
    title: 'Ideate',
    description: 'Generating a wide range of creative solutions and ideas to address the defined problems.',
    deliverables: [
      {
        id: 'brainstorming',
        name: 'Brainstorming Sessions',
        description: 'Collaborative idea generation sessions with stakeholders',
        preparation: {
          steps: [
            'Define the session goal and problem space',
            'Invite diverse participants',
            'Prepare materials and workspace',
            'Set ground rules (no criticism, wild ideas welcome)',
            'Plan time-boxed activities'
          ],
          resources: [
            {
              title: 'Better Brainstorming',
              url: 'https://www.interaction-design.org/literature/article/learn-how-to-use-the-best-ideation-methods-brainstorming'
            }
          ]
        }
      },
      {
        id: 'sketches',
        name: 'Sketches & Wireframes',
        description: 'Quick, low-fidelity drawings of possible solutions',
        preparation: {
          steps: [
            'Gather basic sketching materials',
            'Review user needs and problems',
            'Start with rough thumbnails',
            'Focus on layout and flow',
            'Iterate based on feedback'
          ],
          resources: [
            {
              title: 'UI Sketching Tips',
              url: 'https://www.smashingmagazine.com/2011/12/the-messy-art-of-ux-sketching/'
            }
          ]
        }
      },
      {
        id: 'crazy-eights',
        name: 'Crazy Eights',
        description: 'Rapid sketching exercise to generate multiple solutions quickly',
        preparation: {
          steps: [
            'Fold paper into eight sections',
            'Set timer for 8 minutes',
            'Sketch one idea per section',
            'Focus on quantity over quality',
            'Share and discuss ideas'
          ],
          resources: [
            {
              title: 'Crazy Eights Exercise',
              url: 'https://designsprintkit.withgoogle.com/methodology/phase3-sketch/crazy-8s'
            }
          ]
        }
      },
      {
        id: 'storyboards',
        name: 'Storyboards',
        description: 'Visual sequences showing how users might interact with your solution',
        preparation: {
          steps: [
            'Identify key user scenarios',
            'Create a sequence of frames',
            'Include user actions and reactions',
            'Add context and environment',
            'Keep it simple and clear'
          ],
          resources: [
            {
              title: 'Storyboarding in UX Design',
              url: 'https://www.nngroup.com/articles/storyboards-visualize-ideas/'
            }
          ]
        }
      }
    ]
  },
  {
    title: 'Prototype',
    description: 'Creating scaled-down versions of your product to test your ideas and solutions.',
    deliverables: [
      {
        id: 'paper-prototype',
        name: 'Paper Prototypes',
        description: 'Physical, low-fidelity versions of your interface',
        preparation: {
          steps: [
            'Gather paper, scissors, and markers',
            'Create base screens and elements',
            'Make interactive components',
            'Plan user flows',
            'Prepare for testing session'
          ],
          resources: [
            {
              title: 'Paper Prototyping Guide',
              url: 'https://www.nngroup.com/articles/paper-prototyping/'
            }
          ]
        }
      },
      {
        id: 'digital-wireframes',
        name: 'Digital Wireframes',
        description: 'Basic digital layouts of your interface',
        preparation: {
          steps: [
            'Choose wireframing tool',
            'Set up grid and guidelines',
            'Create basic layout structure',
            'Add placeholder content',
            'Include annotations for interactions'
          ],
          resources: [
            {
              title: 'Wireframing Best Practices',
              url: 'https://www.usability.gov/how-to-and-tools/methods/wireframing.html'
            }
          ]
        }
      },
      {
        id: 'interactive-prototype',
        name: 'Interactive Prototypes',
        description: 'Clickable prototypes that simulate the user experience',
        preparation: {
          steps: [
            'Choose prototyping tool',
            'Import or create screens',
            'Define interactions and transitions',
            'Set up user flows',
            'Test navigation and functionality'
          ],
          resources: [
            {
              title: 'Interactive Prototyping Guide',
              url: 'https://www.smashingmagazine.com/2016/08/prototyping-tool-dilemma/'
            }
          ]
        }
      },
      {
        id: 'design-system',
        name: 'Design Systems',
        description: 'Collection of reusable components and guidelines',
        preparation: {
          steps: [
            'Audit existing design elements',
            'Define design principles',
            'Create component library',
            'Document usage guidelines',
            'Plan maintenance strategy'
          ],
          resources: [
            {
              title: 'Creating Design Systems',
              url: 'https://www.smashingmagazine.com/2019/10/design-systems-guide/'
            }
          ]
        }
      }
    ]
  },
  {
    title: 'Test',
    description: 'Testing your solutions with users to gather feedback and iterate on your designs.',
    deliverables: [
      {
        id: 'usability-testing',
        name: 'Usability Testing',
        description: 'Observing users as they interact with your prototype',
        preparation: {
          steps: [
            'Create test script and tasks',
            'Recruit representative users',
            'Set up testing environment',
            'Prepare recording equipment',
            'Plan how to document findings'
          ],
          resources: [
            {
              title: 'Usability Testing Guide',
              url: 'https://www.nngroup.com/articles/usability-testing-101/'
            }
          ]
        }
      },
      {
        id: 'a-b-testing',
        name: 'A/B Testing',
        description: 'Comparing two versions of a design to see which performs better',
        preparation: {
          steps: [
            'Identify what to test',
            'Create two distinct versions',
            'Define success metrics',
            'Calculate sample size needed',
            'Set up tracking and analytics'
          ],
          resources: [
            {
              title: 'A/B Testing Guide',
              url: 'https://www.optimizely.com/optimization-glossary/ab-testing/'
            }
          ]
        }
      },
      {
        id: 'feedback-sessions',
        name: 'Feedback Sessions',
        description: 'Structured sessions to gather user feedback on your designs',
        preparation: {
          steps: [
            'Prepare discussion guide',
            'Select designs to review',
            'Invite relevant participants',
            'Set up presentation materials',
            'Plan how to capture feedback'
          ],
          resources: [
            {
              title: 'Design Critique Methods',
              url: 'https://www.nngroup.com/articles/design-critiques/'
            }
          ]
        }
      },
      {
        id: 'accessibility-audit',
        name: 'Accessibility Audits',
        description: 'Evaluation of your design\'s accessibility compliance',
        preparation: {
          steps: [
            'Review accessibility guidelines',
            'Check color contrast and typography',
            'Test keyboard navigation',
            'Verify screen reader compatibility',
            'Document findings and recommendations'
          ],
          resources: [
            {
              title: 'Web Accessibility Guidelines',
              url: 'https://www.w3.org/WAI/WCAG21/quickref/'
            }
          ]
        }
      }
    ]
  }
]; 