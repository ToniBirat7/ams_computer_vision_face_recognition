from django.core.management.commands.runserver import Command as RunserverCommand
import os
import sys
from django.core.management import call_command

class Command(RunserverCommand):
    help = 'Run the development server with ASGI/Daphne support'

    def inner_run(self, *args, **options):
        # Import daphne here to avoid import errors
        try:
            from daphne.cli import CommandLineInterface
        except ImportError:
            raise ImportError(
                "daphne is required to run the development server. "
                "To install it, run: pip install daphne"
            )

        # Get the address and port
        self.addr = self._raw_ipv6 and '[%s]' % self.addr or self.addr
        
        # Set up the command line
        cli = CommandLineInterface()
        
        # Build the daphne command arguments
        daphne_args = [
            'daphne',
            '--bind', self.addr,
            '--port', str(self.port),
            '--verbosity', '2',
            '--access-log', '-',
            'AMS.asgi:application'
        ]

        # Print startup message
        self.stdout.write(self.style.SUCCESS(
            f'\nStarting ASGI/Daphne server at http://{self.addr}:{self.port}/\n'
            f'WebSocket endpoint available at ws://{self.addr}:{self.port}/ws/attendance/\n'
            'Quit the server with CTRL-BREAK.\n'
        ))

        # Run daphne
        cli.run(daphne_args) 