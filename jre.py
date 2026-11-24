import flet as ft


def main(page: ft.Page):
    page.title = "Material 3 layout"
    page.padding = 0
    page.theme = ft.Theme(color_scheme_seed="#65558f", use_material3=True)
    page.appbar = ft.AppBar(
        title=ft.Text("Page title"),
        leading=ft.IconButton(icon=ft.Icons.ARROW_BACK, tooltip="Navigate back"),
        actions=[ft.IconButton(icon=ft.Icons.MORE_VERT, tooltip="More options")],
        toolbar_height=64,
        color="#ffffff",
    )
    page.add(
        ft.Container(
            content=ft.Stack(
                width=316,
                height=616,
                controls=[
                    ft.Column(
                        controls=[
                            # Add flow components from the palette to populate this layout.
                        ],
                        width=316,
                        height=616,
                        spacing=14,
                        scroll=ft.ScrollMode.AUTO,
                    ),
                    ft.Container(
                        content=ft.Container(
                            content=ft.Column(
                                [
                                    ft.Icon(ft.Icons.IMAGE),
                                    ft.Text("Add an image", size=14),
                                ],
                                horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                                spacing=8,
                            ),
                            bgcolor="#e9e5ee",
                            border_radius=16,
                            alignment=ft.Alignment(0, 0),
                        ),
                        width=316,
                        height=160,
                        left=0,
                        top=228,
                        alignment=ft.Alignment(0, 0),
                    ),
                    ft.Container(
                        content=ft.FilledButton(
                            content=ft.Text("Continue", size=16),
                            style=ft.ButtonStyle(
                                bgcolor="#6750a4",
                                color="#ffffff",
                                shape=ft.RoundedRectangleBorder(radius=20),
                            ),
                        ),
                        width=316,
                        height=40,
                        left=0,
                        top=288,
                        alignment=ft.Alignment(0, 0),
                    ),
                    ft.Container(
                        content=ft.IconButton(
                            icon=ft.Icons.FAVORITE,
                            tooltip="Favorite",
                            icon_color="#6750a4",
                        ),
                        width=48,
                        height=48,
                        left=0,
                        top=568,
                        alignment=ft.Alignment(0, 0),
                    ),
                    ft.Container(
                        content=ft.FloatingActionButton(
                            icon=ft.Icons.ADD, tooltip="Add", bgcolor="#6750a4"
                        ),
                        width=56,
                        height=56,
                        left=260,
                        top=560,
                        alignment=ft.Alignment(0, 0),
                    ),
                ],
            ),
            width=360,
            padding=22,
        )
    )


ft.run(main, view=ft.AppView.WEB_BROWSER)
