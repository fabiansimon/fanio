from better_profanity import profanity
import argparse

if __name__ == "__main__":
    dirty_text = "That l3sbi4n did a very good H4ndjob."
    parser = argparse.ArgumentParser(description="Check if contains profanity")

    parser.add_argument('string', type=str, help="string to check")

    args = parser.parse_args()

    print(profanity.contains_profanity(args.string))