import unittest
from types import SimpleNamespace
from unittest.mock import Mock
from service import answer, instructions


class ChatTests(unittest.TestCase):
    def test_catalog_grounding(self):
        self.assertIn("Dune", instructions())
        self.assertIn("No ofrece peliculas completas", instructions())

    def test_bounded_history_no_storage(self):
        client = Mock()
        client.responses.create.return_value = SimpleNamespace(output_text="Una recomendacion")
        history = [{"role": "user", "content": "Dune"}] * 20
        self.assertEqual(answer(client, "test-model", history), "Una recomendacion")
        args = client.responses.create.call_args.kwargs
        self.assertEqual(len(args["input"]), 12)
        self.assertFalse(args["store"])
        self.assertEqual(args["max_output_tokens"], 700)

    def test_long_prompt_rejected(self):
        with self.assertRaises(ValueError):
            answer(Mock(), "test", [{"role": "user", "content": "x" * 1501}])


if __name__ == "__main__":
    unittest.main()
