"""
Preloaded Demonstration Environments and Multilingual Navigation Instructions
for Navigate AI (RxR Challenge Research Platform).
"""
from typing import Dict, Any, List

DEMO_ENVIRONMENTS: List[Dict[str, Any]] = [
    {
        "id": "office_floor",
        "name": "Global Tech Research Lab — Floor 4",
        "description": "Multi-corridor research office featuring a central reception, conference rooms, server infrastructure, collaborative workspaces, and cafeteria.",
        "start_node_id": "reception",
        "goal_node_ids": ["executive_office", "server_room", "cafeteria_kitchen"],
        "nodes": [
            {
                "id": "reception",
                "position": [0.0, 0.0, 0.0],
                "room_type": "Reception Lobby",
                "landmarks": ["reception_desk", "visitor_bench", "company_logo", "directory_kiosk"],
                "description": "Spacious entrance with frosted glass doors, a sleek curved reception desk, and a digital directory.",
                "destination_relevance": 0.1
            },
            {
                "id": "corridor_south",
                "position": [0.0, 0.0, 4.0],
                "room_type": "Main Corridor South",
                "landmarks": ["water_cooler", "notice_board", "fire_extinguisher"],
                "description": "Wide carpeted corridor leading south from reception towards conference wings.",
                "destination_relevance": 0.2
            },
            {
                "id": "conference_room_a",
                "position": [-4.0, 0.0, 4.0],
                "room_type": "Conference Room A (Turing)",
                "landmarks": ["conference_table", "projector_screen", "whiteboard", "telepresence_unit"],
                "description": "A glass-walled meeting room with ten ergonomic chairs and dual projection screens.",
                "destination_relevance": 0.5
            },
            {
                "id": "conference_room_b",
                "position": [4.0, 0.0, 4.0],
                "room_type": "Conference Room B (Lovelace)",
                "landmarks": ["round_table", "smart_board", "soundproof_panels"],
                "description": "Smaller collaborative meeting room with an interactive digital board.",
                "destination_relevance": 0.5
            },
            {
                "id": "central_hub",
                "position": [0.0, 0.0, 8.0],
                "room_type": "Central Junction Hub",
                "landmarks": ["elevator_bank", "potted_ficuses", "recycling_station", "emergency_exit_sign"],
                "description": "Major hallway junction intersecting north-south and east-west passageways beside the elevator bank.",
                "destination_relevance": 0.3
            },
            {
                "id": "open_workspace",
                "position": [-5.0, 0.0, 8.0],
                "room_type": "Engineering Open Workspace",
                "landmarks": ["dual_monitor_desks", "standing_desks", "printer_station", "coffee_counter"],
                "description": "Bustling engineering open plan area filled with monitors and collaborative whiteboards.",
                "destination_relevance": 0.6
            },
            {
                "id": "staircase_landing",
                "position": [4.0, 0.0, 8.0],
                "room_type": "Emergency Staircase Landing",
                "landmarks": ["fire_door", "handrail", "stairwell_lighting"],
                "description": "Reinforced concrete stairwell landing connecting to lower and upper levels.",
                "destination_relevance": 0.4
            },
            {
                "id": "cafeteria_kitchen",
                "position": [-5.0, 0.0, 12.0],
                "room_type": "Kitchen & Cafeteria",
                "landmarks": ["espresso_machine", "refrigerator", "dining_tables", "microwave_bank", "snack_bar"],
                "description": "Bright dining area with tiled flooring, stainless appliances, and dining tables.",
                "destination_relevance": 0.8
            },
            {
                "id": "server_room",
                "position": [4.0, 0.0, 12.0],
                "room_type": "Data Center & Server Room",
                "landmarks": ["server_racks", "hvac_cooling_ducts", "biometric_terminal", "status_leds"],
                "description": "Chilled, secure server facility with row after row of glowing blade servers.",
                "destination_relevance": 0.9
            },
            {
                "id": "executive_office",
                "position": [0.0, 0.0, 14.0],
                "room_type": "Director Executive Suite",
                "landmarks": ["mahogany_desk", "leather_armchairs", "credenza", "panoramic_window"],
                "description": "Corner executive office with mahogany furnishings overlooking the city skyline.",
                "destination_relevance": 1.0
            }
        ],
        "edges": [
            {"source": "reception", "target": "corridor_south", "distance": 4.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "corridor_south", "target": "reception", "distance": 4.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "corridor_south", "target": "conference_room_a", "distance": 4.0, "direction": "west", "action": "turn_left", "cost": 1.0, "accessibility": True},
            {"source": "conference_room_a", "target": "corridor_south", "distance": 4.0, "direction": "east", "action": "turn_right", "cost": 1.0, "accessibility": True},

            {"source": "corridor_south", "target": "conference_room_b", "distance": 4.0, "direction": "east", "action": "turn_right", "cost": 1.0, "accessibility": True},
            {"source": "conference_room_b", "target": "corridor_south", "distance": 4.0, "direction": "west", "action": "turn_left", "cost": 1.0, "accessibility": True},

            {"source": "corridor_south", "target": "central_hub", "distance": 4.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "central_hub", "target": "corridor_south", "distance": 4.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "central_hub", "target": "open_workspace", "distance": 5.0, "direction": "west", "action": "turn_left", "cost": 1.0, "accessibility": True},
            {"source": "open_workspace", "target": "central_hub", "distance": 5.0, "direction": "east", "action": "turn_right", "cost": 1.0, "accessibility": True},

            {"source": "central_hub", "target": "staircase_landing", "distance": 4.0, "direction": "east", "action": "turn_right", "cost": 1.0, "accessibility": True},
            {"source": "staircase_landing", "target": "central_hub", "distance": 4.0, "direction": "west", "action": "turn_left", "cost": 1.0, "accessibility": True},

            {"source": "open_workspace", "target": "cafeteria_kitchen", "distance": 4.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "cafeteria_kitchen", "target": "open_workspace", "distance": 4.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "staircase_landing", "target": "server_room", "distance": 4.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "server_room", "target": "staircase_landing", "distance": 4.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "central_hub", "target": "executive_office", "distance": 6.0, "direction": "south", "action": "move_forward", "cost": 1.5, "accessibility": True},
            {"source": "executive_office", "target": "central_hub", "distance": 6.0, "direction": "north", "action": "move_forward", "cost": 1.5, "accessibility": True}
        ]
    },
    {
        "id": "residential_apartment",
        "name": "Contemporary Penthouse Apartment",
        "description": "Multi-room urban residential suite with foyer, living lounge, kitchen island, dining room, balcony, bedrooms, and master suite.",
        "start_node_id": "foyer",
        "goal_node_ids": ["balcony", "master_bedroom", "kitchen"],
        "nodes": [
            {
                "id": "foyer",
                "position": [0.0, 0.0, 0.0],
                "room_type": "Entrance Foyer",
                "landmarks": ["front_door", "shoe_rack", "coat_rack", "wall_mirror"],
                "description": "Polished hardwood entry with an ornate mirror and coat hooks.",
                "destination_relevance": 0.1
            },
            {
                "id": "living_room",
                "position": [0.0, 0.0, 4.0],
                "room_type": "Living Room",
                "landmarks": ["l_shaped_sofa", "marble_coffee_table", "flat_screen_tv", "ambient_floor_lamp"],
                "description": "Open concept living area featuring comfortable velvet seating and a glass centerpiece table.",
                "destination_relevance": 0.4
            },
            {
                "id": "dining_area",
                "position": [-3.5, 0.0, 4.0],
                "room_type": "Dining Room",
                "landmarks": ["dining_table", "dining_chairs", "chandelier", "sideboard_buffet"],
                "description": "Elegant dining space situated under a warm chandelier.",
                "destination_relevance": 0.4
            },
            {
                "id": "kitchen",
                "position": [-3.5, 0.0, 8.0],
                "room_type": "Chef Kitchen",
                "landmarks": ["granite_island", "induction_cooktop", "refrigerator", "wine_rack", "sink"],
                "description": "Modern culinary space with granite countertops and high-end stainless appliances.",
                "destination_relevance": 0.7
            },
            {
                "id": "balcony",
                "position": [0.0, 0.0, 8.5],
                "room_type": "Panoramic Balcony",
                "landmarks": ["sliding_glass_door", "patio_furniture", "potted_plants", "balustrade"],
                "description": "Outdoor terrace with scenic horizon views and decorative planters.",
                "destination_relevance": 0.9
            },
            {
                "id": "inner_hallway",
                "position": [3.5, 0.0, 4.0],
                "room_type": "Private Bedroom Hallway",
                "landmarks": ["wall_art", "recessed_lighting", "linen_closet"],
                "description": "Quiet corridor leading to personal bedrooms and washrooms.",
                "destination_relevance": 0.3
            },
            {
                "id": "guest_bedroom",
                "position": [3.5, 0.0, 0.0],
                "room_type": "Guest Bedroom",
                "landmarks": ["queen_bed", "nightstand", "wardrobe", "curtained_window"],
                "description": "Comfortable guest suite furnished with neutral fabrics.",
                "destination_relevance": 0.6
            },
            {
                "id": "bathroom",
                "position": [3.5, 0.0, 8.0],
                "room_type": "Main Bathroom",
                "landmarks": ["vanity_sink", "glass_shower", "towel_warmer", "bathtub"],
                "description": "Spa-inspired bathroom tiled in Italian marble.",
                "destination_relevance": 0.5
            },
            {
                "id": "master_bedroom",
                "position": [3.5, 0.0, 12.0],
                "room_type": "Master Bedroom Suite",
                "landmarks": ["king_canopy_bed", "walk_in_closet", "dresser", "reading_chaise"],
                "description": "Expansive primary bedroom suite with plush carpeting and plush seating.",
                "destination_relevance": 1.0
            }
        ],
        "edges": [
            {"source": "foyer", "target": "living_room", "distance": 4.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "living_room", "target": "foyer", "distance": 4.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "living_room", "target": "dining_area", "distance": 3.5, "direction": "west", "action": "turn_left", "cost": 1.0, "accessibility": True},
            {"source": "dining_area", "target": "living_room", "distance": 3.5, "direction": "east", "action": "turn_right", "cost": 1.0, "accessibility": True},

            {"source": "dining_area", "target": "kitchen", "distance": 4.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "kitchen", "target": "dining_area", "distance": 4.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "living_room", "target": "balcony", "distance": 4.5, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "balcony", "target": "living_room", "distance": 4.5, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "living_room", "target": "inner_hallway", "distance": 3.5, "direction": "east", "action": "turn_right", "cost": 1.0, "accessibility": True},
            {"source": "inner_hallway", "target": "living_room", "distance": 3.5, "direction": "west", "action": "turn_left", "cost": 1.0, "accessibility": True},

            {"source": "inner_hallway", "target": "guest_bedroom", "distance": 4.0, "direction": "north", "action": "turn_left", "cost": 1.0, "accessibility": True},
            {"source": "guest_bedroom", "target": "inner_hallway", "distance": 4.0, "direction": "south", "action": "turn_right", "cost": 1.0, "accessibility": True},

            {"source": "inner_hallway", "target": "bathroom", "distance": 4.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "bathroom", "target": "inner_hallway", "distance": 4.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "inner_hallway", "target": "master_bedroom", "distance": 8.0, "direction": "south", "action": "move_forward", "cost": 2.0, "accessibility": True},
            {"source": "master_bedroom", "target": "inner_hallway", "distance": 8.0, "direction": "north", "action": "move_forward", "cost": 2.0, "accessibility": True}
        ]
    },
    {
        "id": "hotel_corridor",
        "name": "Grand Horizon Luxury Hotel — Suite Level 7",
        "description": "Symmetrical luxury hotel corridor with brass elevator banks, branching north and south wings, executive guest suites, and service areas.",
        "start_node_id": "elevator_lobby",
        "goal_node_ids": ["presidential_suite_101", "executive_lounge", "suite_105"],
        "nodes": [
            {
                "id": "elevator_lobby",
                "position": [0.0, 0.0, 0.0],
                "room_type": "Elevator Lobby",
                "landmarks": ["brass_elevators", "crystal_chandelier", "concierge_phone", "marble_floor"],
                "description": "Formal arrival lobby with mirror-finished brass elevator doors.",
                "destination_relevance": 0.1
            },
            {
                "id": "central_rotunda",
                "position": [0.0, 0.0, 5.0],
                "room_type": "Central Corridor Rotunda",
                "landmarks": ["bronze_sculpture", "directional_signpost", "decorative_rug"],
                "description": "Round junction carpeted in deep crimson connecting the north and south corridors.",
                "destination_relevance": 0.2
            },
            {
                "id": "north_wing_corridor",
                "position": [-5.0, 0.0, 5.0],
                "room_type": "North Wing Hallway",
                "landmarks": ["wall_sconces", "ice_machine", "suite_signs_101_104"],
                "description": "Quiet corridor illuminated by warm wall sconces leading to premium suites.",
                "destination_relevance": 0.4
            },
            {
                "id": "presidential_suite_101",
                "position": [-8.0, 0.0, 5.0],
                "room_type": "Presidential Suite 101",
                "landmarks": ["double_doors_101", "private_bar", "plush_sofa", "fireplace"],
                "description": "Ultra-luxury guest suite with private lounge and ornate fireplace.",
                "destination_relevance": 1.0
            },
            {
                "id": "deluxe_room_102",
                "position": [-5.0, 0.0, 9.0],
                "room_type": "Deluxe Suite 102",
                "landmarks": ["card_reader_door", "writing_desk", "luggage_rack"],
                "description": "Standard luxury room with mahogany desk and double beds.",
                "destination_relevance": 0.7
            },
            {
                "id": "south_wing_corridor",
                "position": [5.0, 0.0, 5.0],
                "room_type": "South Wing Hallway",
                "landmarks": ["linen_trolley", "vending_machine", "suite_signs_105_108"],
                "description": "Corridor leading past service access to southern guest suites.",
                "destination_relevance": 0.4
            },
            {
                "id": "suite_105",
                "position": [8.0, 0.0, 5.0],
                "room_type": "Junior Suite 105",
                "landmarks": ["suite_door_105", "king_bed", "balcony_access", "minibar"],
                "description": "Southern facing suite with private balcony access.",
                "destination_relevance": 0.8
            },
            {
                "id": "emergency_stairs",
                "position": [5.0, 0.0, 9.0],
                "room_type": "Emergency Stairwell",
                "landmarks": ["heavy_fire_door", "emergency_phone", "exit_lighting"],
                "description": "Concrete pressurized emergency exit stairway.",
                "destination_relevance": 0.3
            },
            {
                "id": "executive_lounge",
                "position": [0.0, 0.0, 10.0],
                "room_type": "Floor 7 VIP Lounge",
                "landmarks": ["buffet_counter", "panoramic_glass", "newspaper_rack", "lounge_chairs"],
                "description": "Exclusive guest retreat featuring panoramic city views and cocktail buffet.",
                "destination_relevance": 0.9
            }
        ],
        "edges": [
            {"source": "elevator_lobby", "target": "central_rotunda", "distance": 5.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "central_rotunda", "target": "elevator_lobby", "distance": 5.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "central_rotunda", "target": "north_wing_corridor", "distance": 5.0, "direction": "west", "action": "turn_left", "cost": 1.0, "accessibility": True},
            {"source": "north_wing_corridor", "target": "central_rotunda", "distance": 5.0, "direction": "east", "action": "turn_right", "cost": 1.0, "accessibility": True},

            {"source": "north_wing_corridor", "target": "presidential_suite_101", "distance": 3.0, "direction": "west", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "presidential_suite_101", "target": "north_wing_corridor", "distance": 3.0, "direction": "east", "action": "turn_around", "cost": 1.0, "accessibility": True},

            {"source": "north_wing_corridor", "target": "deluxe_room_102", "distance": 4.0, "direction": "south", "action": "turn_left", "cost": 1.0, "accessibility": True},
            {"source": "deluxe_room_102", "target": "north_wing_corridor", "distance": 4.0, "direction": "north", "action": "turn_right", "cost": 1.0, "accessibility": True},

            {"source": "central_rotunda", "target": "south_wing_corridor", "distance": 5.0, "direction": "east", "action": "turn_right", "cost": 1.0, "accessibility": True},
            {"source": "south_wing_corridor", "target": "central_rotunda", "distance": 5.0, "direction": "west", "action": "turn_left", "cost": 1.0, "accessibility": True},

            {"source": "south_wing_corridor", "target": "suite_105", "distance": 3.0, "direction": "east", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "suite_105", "target": "south_wing_corridor", "distance": 3.0, "direction": "west", "action": "turn_around", "cost": 1.0, "accessibility": True},

            {"source": "south_wing_corridor", "target": "emergency_stairs", "distance": 4.0, "direction": "south", "action": "turn_right", "cost": 1.0, "accessibility": True},
            {"source": "emergency_stairs", "target": "south_wing_corridor", "distance": 4.0, "direction": "north", "action": "turn_left", "cost": 1.0, "accessibility": True},

            {"source": "central_rotunda", "target": "executive_lounge", "distance": 5.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "executive_lounge", "target": "central_rotunda", "distance": 5.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True}
        ]
    },
    {
        "id": "university_building",
        "name": "Institute of Technology — Turing Science Complex",
        "description": "Multi-tier university building with grand entrance turnstiles, a sunlit central atrium, massive lecture halls, a robotics research lab, and university library.",
        "start_node_id": "main_entrance",
        "goal_node_ids": ["robotics_lab", "library_hall", "faculty_offices"],
        "nodes": [
            {
                "id": "main_entrance",
                "position": [0.0, 0.0, 0.0],
                "room_type": "Campus Main Entrance",
                "landmarks": ["turnstiles", "security_kiosk", "interactive_campus_map", "glass_facade"],
                "description": "Imposing entrance hall equipped with automated security turnstiles.",
                "destination_relevance": 0.1
            },
            {
                "id": "central_atrium",
                "position": [0.0, 0.0, 6.0],
                "room_type": "Sunlit Central Atrium",
                "landmarks": ["glass_skylight", "spiral_staircase", "notice_board", "student_couches"],
                "description": "Soaring multi-story open atrium flooded with natural sunlight from an expansive glass roof.",
                "destination_relevance": 0.3
            },
            {
                "id": "lecture_hall_1",
                "position": [-6.0, 0.0, 6.0],
                "room_type": "Lecture Hall 101 (Physics)",
                "landmarks": ["tiered_wooden_benches", "professor_podium", "blackboards", "projector"],
                "description": "Sloped amphitheater-style auditorium seating 200 students.",
                "destination_relevance": 0.5
            },
            {
                "id": "robotics_lab",
                "position": [-6.0, 0.0, 12.0],
                "room_type": "Autonomous Robotics Laboratory",
                "landmarks": ["robotic_arms", "soldering_benches", "3d_printers", "mobile_robot_arena"],
                "description": "Advanced research facility housing quadrupeds, manipulators, and high-precision test arenas.",
                "destination_relevance": 1.0
            },
            {
                "id": "lecture_hall_2",
                "position": [6.0, 0.0, 6.0],
                "room_type": "Lecture Hall 102 (Computer Science)",
                "landmarks": ["tiered_desks", "dual_laser_projectors", "microphone_stand"],
                "description": "Modern multimedia lecture theater configured for computer science symposiums.",
                "destination_relevance": 0.5
            },
            {
                "id": "faculty_offices",
                "position": [6.0, 0.0, 12.0],
                "room_type": "Faculty & Professor Suites",
                "landmarks": ["faculty_mailboxes", "office_doors", "bookshelves", "department_sign"],
                "description": "Quiet corridor lined with academic offices and consultation rooms.",
                "destination_relevance": 0.7
            },
            {
                "id": "library_hall",
                "position": [0.0, 0.0, 14.0],
                "room_type": "University Research Library",
                "landmarks": ["book_stacks", "silent_study_carrels", "green_shaded_lamps", "reference_desk"],
                "description": "Two-level cathedral of research monographs and silent reading alcoves.",
                "destination_relevance": 0.9
            }
        ],
        "edges": [
            {"source": "main_entrance", "target": "central_atrium", "distance": 6.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "central_atrium", "target": "main_entrance", "distance": 6.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "central_atrium", "target": "lecture_hall_1", "distance": 6.0, "direction": "west", "action": "turn_left", "cost": 1.0, "accessibility": True},
            {"source": "lecture_hall_1", "target": "central_atrium", "distance": 6.0, "direction": "east", "action": "turn_right", "cost": 1.0, "accessibility": True},

            {"source": "lecture_hall_1", "target": "robotics_lab", "distance": 6.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "robotics_lab", "target": "lecture_hall_1", "distance": 6.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "central_atrium", "target": "lecture_hall_2", "distance": 6.0, "direction": "east", "action": "turn_right", "cost": 1.0, "accessibility": True},
            {"source": "lecture_hall_2", "target": "central_atrium", "distance": 6.0, "direction": "west", "action": "turn_left", "cost": 1.0, "accessibility": True},

            {"source": "lecture_hall_2", "target": "faculty_offices", "distance": 6.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "faculty_offices", "target": "lecture_hall_2", "distance": 6.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "central_atrium", "target": "library_hall", "distance": 8.0, "direction": "south", "action": "move_forward", "cost": 1.2, "accessibility": True},
            {"source": "library_hall", "target": "central_atrium", "distance": 8.0, "direction": "north", "action": "move_forward", "cost": 1.2, "accessibility": True}
        ]
    },
    {
        "id": "multi_room_indoor",
        "name": "Subterranean Deep Research Outpost",
        "description": "High-security underground experimental installation with airlock chambers, biological cleanrooms, central telemetry control, materials vault, and observation dome.",
        "start_node_id": "airlock_entry",
        "goal_node_ids": ["control_center", "secure_vault", "cleanroom"],
        "nodes": [
            {
                "id": "airlock_entry",
                "position": [0.0, 0.0, 0.0],
                "room_type": "Decontamination Airlock",
                "landmarks": ["hydraulic_sealed_door", "decontamination_nozzles", "hazard_symbols", "pressure_gauge"],
                "description": "Hermetically sealed chamber with atmospheric sterilization jets.",
                "destination_relevance": 0.1
            },
            {
                "id": "transit_hub",
                "position": [0.0, 0.0, 5.0],
                "room_type": "Hexagonal Transit Hub",
                "landmarks": ["telemetry_displays", "guidance_lasers", "floor_grids", "hazard_containment_panel"],
                "description": "Hexagonal distribution room directing traffic to biological, physical, and control sectors.",
                "destination_relevance": 0.3
            },
            {
                "id": "bio_lab",
                "position": [-5.0, 0.0, 5.0],
                "room_type": "Bioscience Facility",
                "landmarks": ["fume_hoods", "centrifuge_units", "cryogenic_storage", "microscopes"],
                "description": "Bio-safety containment laboratory for biological specimens.",
                "destination_relevance": 0.6
            },
            {
                "id": "cleanroom",
                "position": [-5.0, 0.0, 10.0],
                "room_type": "Class-100 Cleanroom",
                "landmarks": ["laminar_airflow_ceiling", "silicon_spin_coater", "protective_suits_rack"],
                "description": "Particulate-free environment under monochromatic yellow safety lights.",
                "destination_relevance": 0.8
            },
            {
                "id": "control_center",
                "position": [0.0, 0.0, 10.0],
                "room_type": "Command & Operations Center",
                "landmarks": ["video_wall", "operator_consoles", "reactor_telemetry_board", "command_seats"],
                "description": "High-tech operational command hub with real-time sensor monitors.",
                "destination_relevance": 1.0
            },
            {
                "id": "materials_lab",
                "position": [5.0, 0.0, 5.0],
                "room_type": "High-Pressure Materials Lab",
                "landmarks": ["hydraulic_press", "mass_spectrometer", "blast_shields"],
                "description": "Heavy industrial research chamber equipped for extreme stress diagnostics.",
                "destination_relevance": 0.6
            },
            {
                "id": "secure_vault",
                "position": [5.0, 0.0, 10.0],
                "room_type": "Titanium Secure Vault",
                "landmarks": ["titanium_vault_door", "biometric_palm_scanner", "laser_tripwires"],
                "description": "Reinforced underground depository protected by dual cryptographic verification.",
                "destination_relevance": 0.9
            },
            {
                "id": "observation_dome",
                "position": [0.0, 0.0, 15.0],
                "room_type": "Geological Observation Deck",
                "landmarks": ["dome_glass", "seismic_monitors", "panoramic_floodlights"],
                "description": "Cantilevered glass dome offering observation over underground cavern strata.",
                "destination_relevance": 0.7
            }
        ],
        "edges": [
            {"source": "airlock_entry", "target": "transit_hub", "distance": 5.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "transit_hub", "target": "airlock_entry", "distance": 5.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "transit_hub", "target": "bio_lab", "distance": 5.0, "direction": "west", "action": "turn_left", "cost": 1.0, "accessibility": True},
            {"source": "bio_lab", "target": "transit_hub", "distance": 5.0, "direction": "east", "action": "turn_right", "cost": 1.0, "accessibility": True},

            {"source": "bio_lab", "target": "cleanroom", "distance": 5.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "cleanroom", "target": "bio_lab", "distance": 5.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "transit_hub", "target": "control_center", "distance": 5.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "control_center", "target": "transit_hub", "distance": 5.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "transit_hub", "target": "materials_lab", "distance": 5.0, "direction": "east", "action": "turn_right", "cost": 1.0, "accessibility": True},
            {"source": "materials_lab", "target": "transit_hub", "distance": 5.0, "direction": "west", "action": "turn_left", "cost": 1.0, "accessibility": True},

            {"source": "materials_lab", "target": "secure_vault", "distance": 5.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "secure_vault", "target": "materials_lab", "distance": 5.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True},

            {"source": "control_center", "target": "observation_dome", "distance": 5.0, "direction": "south", "action": "move_forward", "cost": 1.0, "accessibility": True},
            {"source": "observation_dome", "target": "control_center", "distance": 5.0, "direction": "north", "action": "move_forward", "cost": 1.0, "accessibility": True}
        ]
    }
]

# ---------------------------------------------------------------------------
# Preloaded Multilingual Instructions (24 diverse samples)
# ---------------------------------------------------------------------------

DEMO_INSTRUCTIONS: List[Dict[str, Any]] = [
    # --- English: Office Floor ---
    {
        "id": "inst_en_office_1",
        "environment_id": "office_floor",
        "language": "en",
        "category": "simple",
        "title": "Straight to Executive Office",
        "instruction": "Walk straight forward past the reception desk, proceed through the central hub, and enter the executive office at the end of the hall.",
        "expected_path": ["reception", "corridor_south", "central_hub", "executive_office"],
        "expected_destination": "executive_office"
    },
    {
        "id": "inst_en_office_2",
        "environment_id": "office_floor",
        "language": "en",
        "category": "multi_turn",
        "title": "Turn Left into Conference Room A",
        "instruction": "Go forward through the corridor, turn left before the elevators, and enter Conference Room A.",
        "expected_path": ["reception", "corridor_south", "conference_room_a"],
        "expected_destination": "conference_room_a"
    },
    {
        "id": "inst_en_office_3",
        "environment_id": "office_floor",
        "language": "en",
        "category": "landmarks",
        "title": "Navigate via Workspaces to Cafeteria",
        "instruction": "Move forward past the reception desk, continue to the central hub, turn left into the open workspace with computer monitors, and walk forward to the cafeteria.",
        "expected_path": ["reception", "corridor_south", "central_hub", "open_workspace", "cafeteria_kitchen"],
        "expected_destination": "cafeteria_kitchen"
    },
    {
        "id": "inst_en_office_4",
        "environment_id": "office_floor",
        "language": "en",
        "category": "sequential",
        "title": "Staircase to Server Room",
        "instruction": "Walk forward down the corridor, turn right at the central hub towards the emergency staircase, then turn and enter the server room.",
        "expected_path": ["reception", "corridor_south", "central_hub", "staircase_landing", "server_room"],
        "expected_destination": "server_room"
    },
    {
        "id": "inst_en_office_5",
        "environment_id": "office_floor",
        "language": "en",
        "category": "ambiguous",
        "title": "Ambiguous Meeting Area (Uncertainty Trigger)",
        "instruction": "Walk forward and enter the glass meeting room with the presentation board.",
        "expected_path": ["reception", "corridor_south", "conference_room_a"],
        "expected_destination": "conference_room_a",
        "triggers_uncertainty": True,
        "uncertainty_reason": "Ambiguity between Conference Room A and Conference Room B"
    },

    # --- Hindi: Office Floor (RxR benchmark style) ---
    {
        "id": "inst_hi_office_1",
        "environment_id": "office_floor",
        "language": "hi",
        "category": "simple",
        "title": "रिसेप्शन से सीधे कार्यकारी कार्यालय तक",
        "instruction": "रिसेप्शन डेस्क से सीधे आगे बढ़ें, गलियारे से होते हुए केंद्रीय हब को पार करें और अंत में कार्यकारी कार्यालय में प्रवेश करें।",
        "expected_path": ["reception", "corridor_south", "central_hub", "executive_office"],
        "expected_destination": "executive_office"
    },
    {
        "id": "inst_hi_office_2",
        "environment_id": "office_floor",
        "language": "hi",
        "category": "multi_turn",
        "title": "बाएं मुड़ें और कॉन्फ्रेंस रूम में जाएं",
        "instruction": "सीधे आगे बढ़ें, गलियारे में बाएं मुड़ें और कॉन्फ्रेंस रूम में प्रवेश करें।",
        "expected_path": ["reception", "corridor_south", "conference_room_a"],
        "expected_destination": "conference_room_a"
    },
    {
        "id": "inst_hi_office_3",
        "environment_id": "office_floor",
        "language": "hi",
        "category": "landmarks",
        "title": "सीढ़ियों के पास से सर्वर रूम तक",
        "instruction": "गलियारे में आगे बढ़ें, केंद्रीय हब के पास दाएं मुड़कर सीढ़ी की तरफ जाएं और सीधे सर्वर रूम में प्रवेश करें।",
        "expected_path": ["reception", "corridor_south", "central_hub", "staircase_landing", "server_room"],
        "expected_destination": "server_room"
    },
    {
        "id": "inst_hi_office_4",
        "environment_id": "office_floor",
        "language": "hi",
        "category": "sequential",
        "title": "वर्कस्पेस से होते हुए कैफेटेरिया जाएं",
        "instruction": "आगे बढ़ें, केंद्रीय जंक्शन पर बाएं मुड़कर ओपन वर्कस्पेस को पार करें और रसोई कैफेटेरिया में रुकें।",
        "expected_path": ["reception", "corridor_south", "central_hub", "open_workspace", "cafeteria_kitchen"],
        "expected_destination": "cafeteria_kitchen"
    },

    # --- Residential Apartment: English & Hindi ---
    {
        "id": "inst_en_apt_1",
        "environment_id": "residential_apartment",
        "language": "en",
        "category": "simple",
        "title": "Walk from Foyer to Scenic Balcony",
        "instruction": "Step forward through the entrance foyer, walk across the living room past the coffee table, and step out onto the balcony.",
        "expected_path": ["foyer", "living_room", "balcony"],
        "expected_destination": "balcony"
    },
    {
        "id": "inst_en_apt_2",
        "environment_id": "residential_apartment",
        "language": "en",
        "category": "multi_turn",
        "title": "Foyer to Kitchen via Dining Room",
        "instruction": "Walk forward into the living area, turn left into the dining room past the chandelier, and enter the kitchen with the granite island.",
        "expected_path": ["foyer", "living_room", "dining_area", "kitchen"],
        "expected_destination": "kitchen"
    },
    {
        "id": "inst_en_apt_3",
        "environment_id": "residential_apartment",
        "language": "en",
        "category": "sequential",
        "title": "Pass Living Room to Master Bedroom",
        "instruction": "Move forward from the foyer, turn right into the bedroom hallway, walk past the bathroom, and enter the master bedroom.",
        "expected_path": ["foyer", "living_room", "inner_hallway", "master_bedroom"],
        "expected_destination": "master_bedroom"
    },
    {
        "id": "inst_hi_apt_1",
        "environment_id": "residential_apartment",
        "language": "hi",
        "category": "simple",
        "title": "लिविंग रूम से बालकनी तक",
        "instruction": "प्रवेश द्वार से सीधे आगे बढ़ें, लिविंग रूम के सोफे के सामने से गुजरते हुए बालकनी में जाएं।",
        "expected_path": ["foyer", "living_room", "balcony"],
        "expected_destination": "balcony"
    },
    {
        "id": "inst_hi_apt_2",
        "environment_id": "residential_apartment",
        "language": "hi",
        "category": "multi_turn",
        "title": "डाइनिंग एरिया से रसोई में जाएं",
        "instruction": "लिविंग रूम में आगे बढ़ें, बाएं मुड़कर डाइनिंग टेबल के पास से जाएं और रसोई में रुकें।",
        "expected_path": ["foyer", "living_room", "dining_area", "kitchen"],
        "expected_destination": "kitchen"
    },
    {
        "id": "inst_hi_apt_3",
        "environment_id": "residential_apartment",
        "language": "hi",
        "category": "landmarks",
        "title": "गलियारे से मास्टर बेडरूम तक",
        "instruction": "प्रवेश से आगे बढ़ें, दाएं मुड़कर बेडरूम गलियारे में जाएं और सीधे मुख्य शयनकक्ष में प्रवेश करें।",
        "expected_path": ["foyer", "living_room", "inner_hallway", "master_bedroom"],
        "expected_destination": "master_bedroom"
    },

    # --- Hotel Corridor: English, Hindi, Spanish ---
    {
        "id": "inst_en_hotel_1",
        "environment_id": "hotel_corridor",
        "language": "en",
        "category": "multi_turn",
        "title": "Elevator Lobby to Presidential Suite 101",
        "instruction": "Leave the elevator lobby, walk forward to the central rotunda, turn left into the North Wing corridor, and enter Presidential Suite 101.",
        "expected_path": ["elevator_lobby", "central_rotunda", "north_wing_corridor", "presidential_suite_101"],
        "expected_destination": "presidential_suite_101"
    },
    {
        "id": "inst_en_hotel_2",
        "environment_id": "hotel_corridor",
        "language": "en",
        "category": "simple",
        "title": "Elevator to Executive Lounge",
        "instruction": "Walk straight ahead past the elevators and through the central rotunda to enter the executive lounge.",
        "expected_path": ["elevator_lobby", "central_rotunda", "executive_lounge"],
        "expected_destination": "executive_lounge"
    },
    {
        "id": "inst_hi_hotel_1",
        "environment_id": "hotel_corridor",
        "language": "hi",
        "category": "multi_turn",
        "title": "लिफ्ट लॉबी से प्रेसिडेंशियल सुइट 101",
        "instruction": "लिफ्ट से सीधे आगे बढ़ें, गोल चक्कर के पास बाएं मुड़ें और सुइट 101 में प्रवेश करें।",
        "expected_path": ["elevator_lobby", "central_rotunda", "north_wing_corridor", "presidential_suite_101"],
        "expected_destination": "presidential_suite_101"
    },
    {
        "id": "inst_es_hotel_1",
        "environment_id": "hotel_corridor",
        "language": "es",
        "category": "multi_turn",
        "title": "Del ascensor a la suite presidencial",
        "instruction": "Salga del ascensor, camine hacia adelante hasta la rotonda central, gire a la izquierda en el pasillo norte y entre a la suite 101.",
        "expected_path": ["elevator_lobby", "central_rotunda", "north_wing_corridor", "presidential_suite_101"],
        "expected_destination": "presidential_suite_101"
    },

    # --- University Building: English & Hindi ---
    {
        "id": "inst_en_uni_1",
        "environment_id": "university_building",
        "language": "en",
        "category": "multi_turn",
        "title": "Main Entrance to Robotics Lab",
        "instruction": "Walk through the turnstiles into the central atrium, turn left past Lecture Hall 1, and enter the robotics lab.",
        "expected_path": ["main_entrance", "central_atrium", "lecture_hall_1", "robotics_lab"],
        "expected_destination": "robotics_lab"
    },
    {
        "id": "inst_en_uni_2",
        "environment_id": "university_building",
        "language": "en",
        "category": "simple",
        "title": "Atrium to University Library",
        "instruction": "Walk straight forward across the central atrium, pass the spiral staircase, and enter the university library reading hall.",
        "expected_path": ["main_entrance", "central_atrium", "library_hall"],
        "expected_destination": "library_hall"
    },
    {
        "id": "inst_hi_uni_1",
        "environment_id": "university_building",
        "language": "hi",
        "category": "multi_turn",
        "title": "मुख्य प्रवेश से रोबोटिक्स लैब तक",
        "instruction": "प्रवेश द्वार से सीधे केंद्रीय एट्रियम में आगे बढ़ें, व्याख्यान कक्ष 1 के पास बाएं मुड़ें और रोबोटिक्स प्रयोगशाला में जाएं।",
        "expected_path": ["main_entrance", "central_atrium", "lecture_hall_1", "robotics_lab"],
        "expected_destination": "robotics_lab"
    },

    # --- Multi-Room Outpost & Challenging / Replanning instructions ---
    {
        "id": "inst_en_outpost_1",
        "environment_id": "multi_room_indoor",
        "language": "en",
        "category": "multi_turn",
        "title": "Airlock to Command Control Center",
        "instruction": "Pass through the airlock, proceed straight through the transit hub, and enter the command control center.",
        "expected_path": ["airlock_entry", "transit_hub", "control_center"],
        "expected_destination": "control_center"
    },
    {
        "id": "inst_en_outpost_2",
        "environment_id": "multi_room_indoor",
        "language": "en",
        "category": "landmarks",
        "title": "Transit to High-Security Vault",
        "instruction": "Move forward from the airlock to the transit hub, turn right into the materials lab, and proceed into the secure vault.",
        "expected_path": ["airlock_entry", "transit_hub", "materials_lab", "secure_vault"],
        "expected_destination": "secure_vault"
    },
    {
        "id": "inst_en_unreachable",
        "environment_id": "office_floor",
        "language": "en",
        "category": "unreachable",
        "title": "Unreachable Destination Test",
        "instruction": "Walk forward and enter the rooftop swimming pool and helicopter pad.",
        "expected_path": [],
        "expected_destination": "rooftop_pool",
        "triggers_uncertainty": True,
        "uncertainty_reason": "Landmark 'rooftop swimming pool' not found in environment graph"
    }
]
